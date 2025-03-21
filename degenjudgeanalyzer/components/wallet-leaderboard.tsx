"use client"

import { Trophy, Medal } from "lucide-react"
import { Card } from "@/components/ui/card"

const wallets = [
  { rank: 1, address: "FNxn...8L9A", value: 140343055850, usdValue: "24T" },
  { rank: 2, address: "5xQn...uuWK", value: 22596997149, usdValue: "4T" },
  { rank: 3, address: "ySNa...eSan", value: 14186859269, usdValue: "2T" },
  { rank: 4, address: "9QEz...DJ57", value: 7455641042, usdValue: "1T" },
  { rank: 5, address: "DDXC...vDXN", value: 3608074397, usdValue: "605B" },
]

export function WalletLeaderboard() {
  return (
    <Card className="court-card rounded-component">
      <div className="court-header">
        <h2 className="text-xl font-medium text-primary flex items-center">
          <Trophy className="h-6 w-6 mr-2" />
          Top Traders
        </h2>
      </div>
      <div className="court-content space-y-2">
        {wallets.map((wallet) => (
          <div
            key={wallet.address}
            className="flex items-center justify-between p-4 bg-secondary/80 rounded-lg text-foreground"
          >
            <div className="flex items-center gap-4">
              <div className="w-8 text-center">
                {wallet.rank <= 3 ? (
                  <Medal
                    className={`h-6 w-6 ${
                      wallet.rank === 1 ? "text-yellow-500" : wallet.rank === 2 ? "text-zinc-400" : "text-amber-600"
                    }`}
                  />
                ) : (
                  <span className="text-muted-foreground">{wallet.rank}</span>
                )}
              </div>
              <span className="font-mono">{wallet.address}</span>
            </div>
            <div className="flex items-center gap-2">
              <span>{(wallet.value / 1e9).toFixed(2)} SOL</span>
              <span className="text-muted-foreground">(${wallet.usdValue})</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}

