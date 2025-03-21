"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Coins } from "lucide-react"
import type { TokenTrade } from "@/lib/analyze-wallet"

interface TokenCardProps {
  token: TokenTrade
  isSelected: boolean
  onClick: () => void
}

export function TokenCard({ token, isSelected, onClick }: TokenCardProps) {
  const [imageError, setImageError] = useState(false)

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      <Card
        className={cn(
          "relative cursor-pointer overflow-hidden transition-colors",
          "bg-secondary/80 hover:bg-secondary",
          isSelected && "ring-2 ring-primary",
        )}
        onClick={onClick}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 overflow-hidden rounded-full border-2 border-primary/50 flex items-center justify-center bg-background">
              {!imageError ? (
                <img
                  src={token.icon || "/placeholder.svg"}
                  alt={token.name}
                  className="h-full w-full object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <Coins className="h-6 w-6 text-primary" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-primary">{token.name}</h3>
              <p className="text-sm text-muted-foreground">{token.symbol}</p>
            </div>
            <div className="text-right">
              <p className="font-mono text-sm">
                {token.totalBoughtSol < 0.001 ? token.totalBoughtSol.toFixed(4) : token.totalBoughtSol.toFixed(3)} SOL
              </p>
              <p
                className={cn(
                  "text-xs font-medium",
                  token.totalSoldSol - token.totalBoughtSol >= 0 ? "text-green-500" : "text-red-500",
                )}
              >
                {token.totalSoldSol - token.totalBoughtSol >= 0 ? "+" : ""}
                {Math.abs(token.totalSoldSol - token.totalBoughtSol) < 0.001
                  ? (token.totalSoldSol - token.totalBoughtSol).toFixed(4)
                  : (token.totalSoldSol - token.totalBoughtSol).toFixed(3)}{" "}
                SOL
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

