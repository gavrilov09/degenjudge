"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Gavel, RefreshCw, Award, ThumbsDown } from "lucide-react"
import { generateTradeAnalysis } from "@/lib/ai-analysis"
import type { TokenTrade } from "@/lib/analyze-wallet"

export function AIVerdict({ trades }: { trades: TokenTrade[] }) {
  const [analysis, setAnalysis] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(false)
  const [isProfitable, setIsProfitable] = useState(false)

  const fetchAnalysis = async () => {
    try {
      setLoading(true)
      setError(null)

      const result = await generateTradeAnalysis(trades)

      if (result.success) {
        setAnalysis(result.analysis)

        // Determine if the overall trading is profitable
        const totalProfit = trades.reduce((sum, trade) => {
          const profit = trade.totalSoldSol - trade.totalBoughtSol
          return sum + profit
        }, 0)

        setIsProfitable(totalProfit > 0)
      } else {
        setError("Failed to generate analysis")
      }
    } catch (err) {
      console.error("Error fetching analysis:", err)
      setError("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (trades.length > 0) {
      fetchAnalysis()
    }
  }, [trades])

  if (trades.length === 0) return null

  return (
    <Card className={`court-card overflow-visible ${isProfitable ? "verdict-profitable" : "verdict-unprofitable"}`}>
      <CardHeader className="court-header relative py-8">
        <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-card border-2 border-primary/50 rounded-full p-3 shadow-glow">
          {isProfitable ? <Award className="h-8 w-8 text-primary" /> : <ThumbsDown className="h-8 w-8 text-primary" />}
        </div>
        <CardTitle className="text-xl font-medium text-primary flex items-center gap-2 mt-10 justify-center">
          <Gavel className="h-5 w-5" />
          Judge's Verdict
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 relative">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="relative">
              <RefreshCw className="h-10 w-10 text-primary animate-spin" />
              <div className="absolute inset-0 bg-primary/10 blur-xl rounded-full"></div>
            </div>
            <p className="ml-4 text-lg font-medium text-primary animate-pulse">The Judge is deliberating...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-destructive mb-2">{error}</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={fetchAnalysis}>
              Try Again
            </Button>
          </div>
        ) : analysis ? (
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <div className="verdict-text-container relative">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-primary to-transparent opacity-70"></div>
                <div className="absolute right-0 top-0 bottom-0 w-1 bg-gradient-to-b from-transparent via-primary to-transparent opacity-70"></div>

                <motion.div
                  className="verdict-text"
                  initial={false}
                  animate={{
                    maxHeight: expanded || analysis.length <= 500 ? 2000 : 200,
                    opacity: 1,
                  }}
                  transition={{
                    maxHeight: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
                    opacity: { duration: 0.2 },
                  }}
                  style={{ overflow: "hidden" }}
                >
                  {analysis.split("\n").map((paragraph, index) =>
                    paragraph.trim() ? (
                      <p key={index} className="my-3 leading-relaxed">
                        {paragraph
                          .trim()
                          .split(/(\*\*.*?\*\*)/)
                          .map((part, i) => {
                            if (part.startsWith("**") && part.endsWith("**")) {
                              return <strong key={i}>{part.slice(2, -2)}</strong>
                            }
                            return part
                          })}
                      </p>
                    ) : null,
                  )}
                </motion.div>
              </div>

              {!expanded && analysis.length > 500 && (
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-card to-transparent pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                ></motion.div>
              )}

              {analysis.length > 500 && (
                <motion.div
                  className="text-center mt-6 relative z-10"
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setExpanded(!expanded)}
                    className="text-primary hover:text-primary hover:bg-primary/20 border-primary/50 transition-all duration-300 shadow-sm"
                  >
                    {expanded ? "Show Less" : "Read Full Verdict"}
                  </Button>
                </motion.div>
              )}
            </motion.div>
          </AnimatePresence>
        ) : null}
      </CardContent>
    </Card>
  )
}

