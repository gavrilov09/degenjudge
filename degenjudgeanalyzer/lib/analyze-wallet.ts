const HELIUS_API_KEY = "d13b6ff7-4339-47b0-a4e8-a59c6b317254"
const HELIUS_RPC_URL = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`

// Known token addresses to exclude
const EXCLUDED_TOKENS = new Set([
  "So11111111111111111111111111111111111111112", // wSOL
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // USDC
])

// Cache for token metadata to avoid duplicate requests
const tokenMetadataCache = new Map<string, { name: string; symbol: string; icon: string } | null>()

// Request queue implementation with improved concurrency
class RequestQueue {
  private queue: Array<() => Promise<any>> = []
  private processing = false
  private lastRequestTime = 0
  private readonly minDelay = 75 // Slightly reduced from 100ms
  private readonly maxConcurrent = 4 // Allow up to 4 concurrent requests

  private activeRequests = 0

  async add<T>(request: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const now = Date.now()
          const timeSinceLastRequest = now - this.lastRequestTime
          if (timeSinceLastRequest < this.minDelay) {
            await sleep(this.minDelay - timeSinceLastRequest)
          }
          this.lastRequestTime = Date.now()
          this.activeRequests++
          const result = await request()
          this.activeRequests--
          resolve(result)
        } catch (error: any) {
          this.activeRequests--
          reject(error)
        }
      })
      this.process()
    })
  }

  private async process() {
    if (this.processing) return
    this.processing = true

    while (this.queue.length > 0 && this.activeRequests < this.maxConcurrent) {
      const request = this.queue.shift()
      if (request) {
        request().catch(console.error) // Process in background
      }
    }

    if (this.queue.length > 0) {
      setTimeout(() => this.process(), this.minDelay)
    } else {
      this.processing = false
    }
  }
}

const requestQueue = new RequestQueue()

type TradingPeriod = {
  firstBuyTimestamp: number
  lastSellTimestamp: number
  totalBoughtSol: number
  totalSoldSol: number
  profit: number
  holdingPeriodDays: number
  holdingPeriodFormatted: string
}

export type TokenTrade = {
  mint: string
  name: string
  symbol: string
  icon: string
  firstBuyTimestamp: number
  lastSellTimestamp: number | null
  totalBoughtSol: number
  totalSoldSol: number
  holdingPeriodDays: number
  holdingPeriodFormatted: string
  isHolding: boolean
  tradingPeriods: TradingPeriod[]
  bestPeriod: TradingPeriod | null
}

// Helper function to delay execution
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

// Helper function to retry failed requests
async function retry<T>(fn: () => Promise<T>, retries = 2, delay = 800): Promise<T> {
  try {
    return await fn()
  } catch (error: any) {
    if (retries === 0) throw error
    await sleep(delay)
    return retry(fn, retries - 1, delay * 1.5)
  }
}

// Helper function to process in batches with improved concurrency
async function processBatch<T, R>(items: T[], batchSize: number, processor: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = []
  const actualBatchSize = Math.min(batchSize, 4) // Increased from 3 to 4

  for (let i = 0; i < items.length; i += actualBatchSize) {
    const batch = items.slice(i, i + actualBatchSize)
    const batchResults = await Promise.all(
      batch.map(async (item) => {
        try {
          return await processor(item)
        } catch (error: any) {
          console.error("Error processing item:", error)
          return null
        }
      }),
    )
    results.push(...batchResults.filter((r): r is R => r !== null))
    if (i + actualBatchSize < items.length) {
      await sleep(800) // Slightly reduced from 1000ms
    }
  }
  return results
}

async function fetchTransactionSignatures(address: string, limit = 75): Promise<any[]> {
  try {
    const response = await fetch(HELIUS_RPC_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "my-id",
        method: "getSignaturesForAddress",
        params: [
          address,
          {
            limit: limit, // Reduced from 100 to 75 for faster initial results
          },
        ],
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    if (!data.result || !Array.isArray(data.result)) {
      throw new Error("Invalid response format")
    }

    return data.result
  } catch (error: any) {
    console.error("Error fetching signatures:", error)
    throw error
  }
}

async function fetchTransaction(signature: string): Promise<any> {
  return retry(async () => {
    const response = await fetch(HELIUS_RPC_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "my-id",
        method: "getTransaction",
        params: [
          signature,
          {
            encoding: "jsonParsed",
            maxSupportedTransactionVersion: 0,
            commitment: "confirmed",
          },
        ],
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    if (data.error) {
      throw new Error(`API error: ${JSON.stringify(data.error)}`)
    }

    if (!data.result) {
      return null
    }

    return data.result
  })
}

async function fetchTokenMetadata(mint: string): Promise<{ name: string; symbol: string; icon: string } | null> {
  // Check cache first
  if (tokenMetadataCache.has(mint)) {
    return tokenMetadataCache.get(mint)
  }

  let retryCount = 0
  const maxRetries = 3 // Reduced from 5 to 3
  const baseDelay = 1500 // Reduced from 2000ms

  while (retryCount < maxRetries) {
    try {
      // Use the request queue for rate limiting
      const response = await requestQueue.add(() =>
        fetch(HELIUS_RPC_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: "my-id",
            method: "getAsset",
            params: [mint],
          }),
        }),
      )

      if (response.status === 429) {
        const retryAfter = response.headers.get("retry-after")
        const delay = retryAfter ? Number.parseInt(retryAfter) * 1000 : baseDelay * Math.pow(1.5, retryCount)
        await sleep(delay)
        retryCount++
        continue
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      // Check for specific error cases
      if (!data || typeof data !== "object") {
        throw new Error("Invalid response format")
      }

      if (data.error) {
        throw new Error(typeof data.error === "object" ? JSON.stringify(data.error) : data.error)
      }

      if (!data.result) {
        throw new Error("No result found in response")
      }

      // Extract and validate metadata
      const result = data.result
      if (!result || typeof result !== "object") {
        throw new Error("Invalid result format")
      }

      // Extract metadata with more detailed validation
      const tokenInfo = result.token_info || {}
      const content = result.content || {}
      const metadata = content.metadata || {}
      const links = content.links || {}

      // Validate and extract name/symbol with fallbacks
      const name = tokenInfo.name || metadata.name || result.name
      const symbol = tokenInfo.symbol || metadata.symbol || result.symbol

      if (!name && !symbol) {
        throw new Error(`No name or symbol found for token ${mint}`)
      }

      // Try to get the icon URL with validation
      const possibleIcons = [
        metadata.image,
        links.image,
        content.json_uri,
        content.files?.[0]?.uri,
        result.image,
      ].filter(Boolean)

      let icon = possibleIcons[0] || "/placeholder.svg?height=48&width=48"

      // Handle IPFS URLs
      if (icon?.startsWith("ipfs://")) {
        icon = `https://ipfs.io/ipfs/${icon.slice(7)}`
      }

      // Validate URL format
      try {
        new URL(icon)
      } catch {
        icon = "/placeholder.svg?height=48&width=48"
      }

      // Cache and return validated metadata
      const metadataResult = {
        name: name || `Token ${mint.slice(0, 4)}...${mint.slice(-4)}`,
        symbol: symbol || "UNKNOWN",
        icon,
      }

      tokenMetadataCache.set(mint, metadataResult)
      return metadataResult
    } catch (error: any) {
      if (retryCount === maxRetries - 1) {
        // On last retry, return basic metadata
        const fallbackMetadata = {
          name: `Token ${mint.slice(0, 4)}...${mint.slice(-4)}`,
          symbol: "UNKNOWN",
          icon: "/placeholder.svg?height=48&width=48",
        }
        tokenMetadataCache.set(mint, fallbackMetadata)
        return fallbackMetadata
      }

      // Exponential backoff
      const delay = baseDelay * Math.pow(1.5, retryCount)
      await sleep(delay)
      retryCount++
    }
  }

  // This should never be reached due to the return in the last retry
  return null
}

function formatHoldingPeriod(firstBuyTimestamp: number, lastSellTimestamp: number | null): string {
  if (!firstBuyTimestamp || !lastSellTimestamp) return "0 days"

  // Convert seconds to milliseconds for calculations
  const firstBuyMs = firstBuyTimestamp * 1000
  const lastSellMs = lastSellTimestamp * 1000

  // Calculate difference in seconds
  const diffSeconds = Math.floor((lastSellMs - firstBuyMs) / 1000)

  if (diffSeconds < 0) {
    return "1 minute" // Minimum holding period
  }

  const days = Math.floor(diffSeconds / (24 * 60 * 60))
  const hours = Math.floor((diffSeconds % (24 * 60 * 60)) / (60 * 60))
  const minutes = Math.floor((diffSeconds % (60 * 60)) / 60)

  // If more than 1 day, show days
  if (days > 0) {
    return `${days} day${days > 1 ? "s" : ""}`
  }
  // If more than 1 hour, show hours
  if (hours > 0) {
    return `${hours} hour${hours > 1 ? "s" : ""}`
  }
  // Show minutes with minimum of 1 minute
  return `${Math.max(1, minutes)} minute${minutes > 1 ? "s" : ""}`
}

function calculateHoldingPeriod(firstBuyTimestamp: number, lastSellTimestamp: number | null): number {
  if (!firstBuyTimestamp || !lastSellTimestamp) return 0

  // Convert seconds to milliseconds for calculations
  const firstBuyMs = firstBuyTimestamp * 1000
  const lastSellMs = lastSellTimestamp * 1000

  // Calculate difference in days
  const diffDays = Math.floor((lastSellMs - firstBuyMs) / (1000 * 60 * 60 * 24))

  return Math.max(0, diffDays) // Ensure non-negative
}

export async function analyzeWallet(address: string): Promise<TokenTrade[]> {
  try {
    // Fetch a limited number of signatures to start with
    const signatures = await fetchTransactionSignatures(address, 75)

    // First, collect all transactions with improved concurrency
    const validTransactions = await processBatch(signatures.reverse(), 8, async (sig: any) => {
      if (!sig.signature || !sig.blockTime) {
        return null
      }
      const tx = await fetchTransaction(sig.signature)
      return tx ? { tx, timestamp: sig.blockTime, signature: sig.signature } : null
    })

    // Create a map to track token balances and transactions
    const tokenData = new Map<
      string,
      {
        transactions: Array<{
          timestamp: number
          signature: string
          isBuy: boolean
          solAmount: number
        }>
        currentBalance: number
      }
    >()

    // Process each transaction to identify token swaps
    for (const { tx, timestamp, signature } of validTransactions) {
      if (!tx?.meta?.preTokenBalances || !tx?.meta?.postTokenBalances) continue

      // Find the wallet's account index
      let walletIndex = -1
      if (tx.transaction?.message?.accountKeys) {
        const accountKeys = tx.transaction.message.accountKeys
        for (let i = 0; i < accountKeys.length; i++) {
          const key = accountKeys[i]
          const pubkey = typeof key === "string" ? key : key.pubkey
          if (pubkey === address) {
            walletIndex = i
            break
          }
        }
      }

      if (walletIndex === -1) continue // Wallet not found in transaction

      // Get wallet's SOL balance change
      const walletPreBalance = tx.meta.preBalances[walletIndex] || 0
      const walletPostBalance = tx.meta.postBalances[walletIndex] || 0
      const walletSolChange = (walletPreBalance - walletPostBalance) / 1e9 // Convert lamports to SOL

      // Group token balances by owner
      const preBalances = new Map()
      const postBalances = new Map()

      for (const balance of tx.meta.preTokenBalances) {
        if (balance.owner === address) {
          preBalances.set(balance.mint, balance.uiTokenAmount?.uiAmount || 0)
        }
      }

      for (const balance of tx.meta.postTokenBalances) {
        if (balance.owner === address) {
          postBalances.set(balance.mint, balance.uiTokenAmount?.uiAmount || 0)
        }
      }

      // Find tokens with balance changes
      for (const [mint, postAmount] of postBalances.entries()) {
        if (EXCLUDED_TOKENS.has(mint)) continue

        const preAmount = preBalances.get(mint) || 0
        const tokenBalanceChange = postAmount - preAmount

        // Skip if no significant change
        if (Math.abs(tokenBalanceChange) < 0.000001) continue

        const isBuy = tokenBalanceChange > 0

        // For buys: wallet SOL decreases (positive change)
        // For sells: wallet SOL increases (negative change)
        // Skip if the SOL change doesn't match the expected direction
        if ((isBuy && walletSolChange <= 0) || (!isBuy && walletSolChange >= 0)) continue

        // Calculate the actual SOL amount
        const solAmount = Math.abs(walletSolChange)

        // Skip very small transactions
        if (solAmount < 0.000001) continue

        // Initialize token data if not exists
        if (!tokenData.has(mint)) {
          tokenData.set(mint, {
            transactions: [],
            currentBalance: 0,
          })
        }

        // Update token data
        const data = tokenData.get(mint)!
        data.transactions.push({
          timestamp,
          signature,
          isBuy,
          solAmount,
        })

        // Update current balance
        if (isBuy) {
          data.currentBalance += tokenBalanceChange
        } else {
          data.currentBalance = Math.max(0, data.currentBalance - Math.abs(tokenBalanceChange))
        }
      }
    }

    // Analyze token trading periods
    const trades: TokenTrade[] = []

    for (const [mint, data] of tokenData.entries()) {
      // Sort transactions by timestamp
      data.transactions.sort((a, b) => a.timestamp - b.timestamp)

      // Skip tokens with no transactions
      if (data.transactions.length === 0) continue

      // Analyze trading periods
      let tokenBalance = 0
      let currentPeriod: TradingPeriod | null = null
      const periods: TradingPeriod[] = []

      for (const tx of data.transactions) {
        const prevBalance = tokenBalance

        if (tx.isBuy) {
          tokenBalance += 1 // Just tracking token presence, not amount

          // Start new period on first buy or buy after full sell
          if (prevBalance === 0) {
            if (currentPeriod) {
              periods.push(currentPeriod)
            }

            currentPeriod = {
              firstBuyTimestamp: tx.timestamp,
              lastSellTimestamp: 0,
              totalBoughtSol: tx.solAmount,
              totalSoldSol: 0,
              profit: 0,
              holdingPeriodDays: 0,
              holdingPeriodFormatted: "0 days",
            }
          } else if (currentPeriod) {
            // Add to existing period
            currentPeriod.totalBoughtSol += tx.solAmount
          }
        } else {
          // Sell transaction
          tokenBalance = Math.max(0, tokenBalance - 1)

          if (currentPeriod) {
            currentPeriod.totalSoldSol += tx.solAmount
            currentPeriod.lastSellTimestamp = tx.timestamp
            currentPeriod.profit = currentPeriod.totalSoldSol - currentPeriod.totalBoughtSol
            currentPeriod.holdingPeriodDays = calculateHoldingPeriod(currentPeriod.firstBuyTimestamp, tx.timestamp)
            currentPeriod.holdingPeriodFormatted = formatHoldingPeriod(currentPeriod.firstBuyTimestamp, tx.timestamp)

            // If balance is 0 after a sell, finalize the period
            if (tokenBalance === 0) {
              periods.push(currentPeriod)
              currentPeriod = null
            }
          }
        }
      }

      // Add final period if it exists and has a sell
      if (currentPeriod && currentPeriod.lastSellTimestamp > 0) {
        periods.push(currentPeriod)
      }

      // Only create trade entry if we have completed periods
      if (periods.length > 0) {
        // Find the most profitable period
        const bestPeriod = periods.reduce(
          (best, current) => (!best || current.profit > best.profit ? current : best),
          periods[0],
        )

        trades.push({
          mint,
          name: "Unknown Token",
          symbol: "UNKNOWN",
          icon: "/placeholder.svg?height=48&width=48",
          firstBuyTimestamp: bestPeriod.firstBuyTimestamp,
          lastSellTimestamp: bestPeriod.lastSellTimestamp,
          totalBoughtSol: periods.reduce((sum, p) => sum + p.totalBoughtSol, 0),
          totalSoldSol: periods.reduce((sum, p) => sum + p.totalSoldSol, 0),
          holdingPeriodDays: bestPeriod.holdingPeriodDays,
          holdingPeriodFormatted: bestPeriod.holdingPeriodFormatted,
          isHolding: data.currentBalance > 0.000001,
          tradingPeriods: periods,
          bestPeriod,
        })
      }
    }

    // Sort trades by profit and limit to top 20
    trades.sort((a, b) => {
      const profitA = a.bestPeriod?.profit || 0
      const profitB = b.bestPeriod?.profit || 0
      return profitB - profitA
    })

    const topTrades = trades.slice(0, 20)

    // Fetch metadata for top trades
    const tradesWithMetadata = await processBatch(topTrades, 8, async (trade) => {
      const metadata = await fetchTokenMetadata(trade.mint)
      if (metadata) {
        return {
          ...trade,
          name: metadata.name,
          symbol: metadata.symbol,
          icon: metadata.icon,
        }
      }
      return trade
    })

    return tradesWithMetadata.filter(
      (trade) => trade.totalBoughtSol > 0 && trade.tradingPeriods.length > 0 && trade.bestPeriod !== null,
    )
  } catch (error: any) {
    console.error("Error in analyzeWallet:", error)
    throw new Error(`Failed to analyze wallet: ${error instanceof Error ? error.message : String(error)}`)
  }
}

