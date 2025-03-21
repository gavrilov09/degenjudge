"use server"

import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import type { TokenTrade } from "./analyze-wallet"

if (!process.env.OPENAI_API_KEY) {
  throw new Error("Missing OPENAI_API_KEY environment variable")
}

export async function generateTradeAnalysis(trades: TokenTrade[]) {
  try {
    // Calculate overall performance metrics
    const totalProfit = trades.reduce((sum, trade) => {
      const profit = trade.totalSoldSol - trade.totalBoughtSol
      return sum + profit
    }, 0)

    const winningTrades = trades.filter((trade) => trade.totalSoldSol - trade.totalBoughtSol > 0).length
    const losingTrades = trades.filter((trade) => trade.totalSoldSol - trade.totalBoughtSol <= 0).length
    const winRate = trades.length > 0 ? (winningTrades / trades.length) * 100 : 0

    // Get the best and worst trades
    const sortedTrades = [...trades].sort((a, b) => {
      const profitA = a.totalSoldSol - a.totalBoughtSol
      const profitB = b.totalSoldSol - b.totalBoughtSol
      return profitB - profitA
    })

    const bestTrade = sortedTrades.length > 0 ? sortedTrades[0] : null
    const worstTrade = sortedTrades.length > 0 ? sortedTrades[sortedTrades.length - 1] : null

    // Create a summary of the trading data
    const tradingSummary = {
      totalTrades: trades.length,
      winningTrades,
      losingTrades,
      winRate: winRate.toFixed(1),
      totalProfit: totalProfit.toFixed(4),
      isProfitable: totalProfit > 0,
      bestTrade: bestTrade
        ? {
            name: bestTrade.name,
            symbol: bestTrade.symbol,
            profit: (bestTrade.totalSoldSol - bestTrade.totalBoughtSol).toFixed(4),
            holdingPeriod: bestTrade.holdingPeriodFormatted,
          }
        : null,
      worstTrade: worstTrade
        ? {
            name: worstTrade.name,
            symbol: worstTrade.symbol,
            profit: (worstTrade.totalSoldSol - worstTrade.totalBoughtSol).toFixed(4),
            holdingPeriod: worstTrade.holdingPeriodFormatted,
          }
        : null,
      tradeNames: trades.slice(0, 5).map((t) => t.name || t.symbol),
    }

    // Generate the analysis using OpenAI
    const { text } = await generateText({
      model: openai("gpt-4o"),
      system: `You are DegenJudge, a hilarious and brutally honest crypto trading judge who analyzes Solana wallet trading performance. 
      
Your task is to create a funny, sarcastic verdict (200-300 words) on the user's trading history using crypto slang and meme culture references.

If the user is profitable:
- Praise them in an over-the-top way
- Call them a "chad," "degen genius," or similar compliments
- Make jokes about them being the next crypto billionaire
- Suggest they should be giving financial advice (sarcastically)

If the user is losing money:
- Roast them mercilessly (but keep it funny, not mean-spirited)
- Call them "ngmi," "paper hands," or similar crypto insults
- Make jokes about them buying tops and selling bottoms
- Suggest ridiculous ways they could improve (like trading blindfolded)

Always include:
- References to specific tokens they traded
- Comments on their win rate
- At least one absurd piece of "advice" for future trades
- A final "verdict" on their trading skills (on a scale like "Certified Degen" to "Exit Liquidity Provider")

Use crypto slang like: ngmi, wagmi, wen lambo, aping in, diamond hands, exit liquidity, ser, degen, etc.

Keep it entertaining and in the voice of a judge delivering a verdict in "degen court."

Format your response with proper spacing between paragraphs for readability. Use **bold** for emphasis on key phrases or your final verdict.`,
      prompt: `Here's the trading data for a Solana wallet:
      
Total Trades: ${tradingSummary.totalTrades}
Winning Trades: ${tradingSummary.winningTrades}
Losing Trades: ${tradingSummary.losingTrades}
Win Rate: ${tradingSummary.winRate}%
Total Profit/Loss: ${tradingSummary.totalProfit} SOL
Overall: ${tradingSummary.isProfitable ? "PROFITABLE" : "UNPROFITABLE"}

${tradingSummary.bestTrade ? `Best Trade: ${tradingSummary.bestTrade.name} (${tradingSummary.bestTrade.symbol}) with ${tradingSummary.bestTrade.profit} SOL profit over ${tradingSummary.bestTrade.holdingPeriod}` : ""}
${tradingSummary.worstTrade ? `Worst Trade: ${tradingSummary.worstTrade.name} (${tradingSummary.worstTrade.symbol}) with ${tradingSummary.worstTrade.profit} SOL profit over ${tradingSummary.worstTrade.holdingPeriod}` : ""}

Notable tokens traded: ${tradingSummary.tradeNames.join(", ")}

Based on this data, provide your hilarious verdict on this trader's performance.`,
    })

    return { success: true, analysis: text }
  } catch (error) {
    console.error("Error generating trade analysis:", error)
    return {
      success: false,
      analysis: "The Judge is currently unavailable. Too many degens in the courtroom today.",
    }
  }
}

