"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { analyzeWallet, type TokenTrade } from "@/lib/analyze-wallet"
import { TokenCard } from "@/components/token-card"
import { AlertTriangle, Clock, Coins, Info } from "lucide-react"
import { BlobLoader } from "@/components/blob-loader"
import { AIVerdict } from "@/components/ai-verdict"

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1 },
  }),
}

export function WalletResults({ address }: { address: string }) {
  const [trades, setTrades] = useState<TokenTrade[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTrade, setSelectedTrade] = useState<TokenTrade | null>(null)

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = await analyzeWallet(address)
        setTrades(data)
        setSelectedTrade(data[0] || null)
      } catch (err) {
        console.error("Error analyzing wallet:", err)
        setError(err instanceof Error ? err.message : "Failed to analyze wallet")
      } finally {
        setLoading(false)
      }
    }
    fetchResults()
  }, [address])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] w-full mt-16">
        <BlobLoader />
      </div>
    )
  }

  if (error)
    return (
      <Card className="bg-destructive/10 p-6 text-center">
        <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
        <p className="text-destructive font-semibold">{error}</p>
      </Card>
    )

  if (trades.length === 0)
    return (
      <Card className="p-6 text-center">
        <Coins className="h-8 w-8 text-primary mx-auto mb-2" />
        <p className="font-semibold">No completed memecoin trades found for this wallet.</p>
        <p className="text-muted-foreground mt-2">Only showing sold positions with verified token metadata.</p>
      </Card>
    )

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* AI Verdict Card - Added at the top */}
      <AIVerdict trades={trades} />

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-medium text-primary">Memecoin Trading History</CardTitle>
          {trades.length === 20 && (
            <div className="flex items-center text-sm text-muted-foreground mt-1">
              <Info className="h-4 w-4 mr-1" />
              Showing top 20 trades by profit for performance reasons
            </div>
          )}
        </CardHeader>
        <CardContent>
          <ScrollArea className="w-full whitespace-nowrap rounded-lg">
            <div className="flex w-max space-x-4 pl-2 pr-4 py-4 pb-6">
              {trades.map((trade, index) => (
                <motion.div key={trade.mint} variants={cardVariants} initial="hidden" animate="visible" custom={index}>
                  <TokenCard
                    token={trade}
                    isSelected={selectedTrade?.mint === trade.mint}
                    onClick={() => setSelectedTrade(trade)}
                  />
                </motion.div>
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </CardContent>
      </Card>

      {selectedTrade && selectedTrade.bestPeriod && (
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-medium text-primary flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Best Trading Period Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Bought</p>
                <p className="text-lg font-semibold">{selectedTrade.bestPeriod.totalBoughtSol.toFixed(4)} SOL</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Sold</p>
                <p className="text-lg font-semibold">{selectedTrade.bestPeriod.totalSoldSol.toFixed(4)} SOL</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">First Buy</p>
                <p className="text-lg font-semibold">
                  {new Date(selectedTrade.bestPeriod.firstBuyTimestamp * 1000).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Sell</p>
                <p className="text-lg font-semibold">
                  {new Date(selectedTrade.bestPeriod.lastSellTimestamp * 1000).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Holding Period</p>
                <p className="text-lg font-semibold">{selectedTrade.bestPeriod.holdingPeriodFormatted}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Trading Periods</p>
                <p className="text-lg font-semibold">{selectedTrade.tradingPeriods.length}</p>
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm text-muted-foreground">Best Period Profit/Loss</p>
              <p
                className={`text-lg font-semibold ${
                  selectedTrade.bestPeriod.profit > 0 ? "text-green-500" : "text-red-500"
                }`}
              >
                {selectedTrade.bestPeriod.profit.toFixed(4)} SOL
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

