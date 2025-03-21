"use client"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WalletLeaderboard } from "@/components/wallet-leaderboard"
import { ConfessionLeaderboard } from "@/components/confession-leaderboard"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { GiftIcon, Clock } from "lucide-react"

const tabVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
}

const getNextMondayMidnight = () => {
  const now = new Date()
  const nextMonday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + ((8 - now.getDay()) % 7))
  nextMonday.setHours(0, 0, 0, 0)
  return nextMonday
}

export function LeaderboardTabs() {
  const [activeTab, setActiveTab] = useState("wallets")
  const [timeUntilReset, setTimeUntilReset] = useState("")

  useEffect(() => {
    const updateTimer = () => {
      const now = new Date()
      const nextReset = getNextMondayMidnight()
      const timeDiff = nextReset.getTime() - now.getTime()

      if (timeDiff <= 0) {
        setTimeUntilReset("Resetting...")
        setTimeout(updateTimer, 1000)
      } else {
        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24))
        const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60))
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000)

        setTimeUntilReset(`${days}d ${hours}h ${minutes}m ${seconds}s`)
        setTimeout(updateTimer, 1000)
      }
    }

    updateTimer()
  }, [])

  return (
    <div className="w-full max-w-4xl space-y-6">
      <Card className="court-card rounded-component">
        <CardHeader>
          <CardTitle className="flex items-center justify-between text-primary">
            <div className="flex items-center">
              <GiftIcon className="mr-2 h-6 w-6" />
              Airdrop Rewards
            </div>
            <div className="flex items-center text-sm">
              <Clock className="mr-2 h-4 w-4" />
              Next reset: {timeUntilReset}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-foreground">
            Weekly airdrops for top 10 in both leaderboards. Leaderboards reset every Monday at midnight EST. Climb the
            ranks and earn DegenJudge tokens!
          </p>
        </CardContent>
      </Card>

      <Tabs defaultValue="wallets" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 bg-secondary/50 p-1">
          <TabsTrigger
            value="wallets"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300 hover:scale-105"
          >
            Top Traders
          </TabsTrigger>
          <TabsTrigger
            value="confessions"
            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300 hover:scale-105"
          >
            Top Confessions
          </TabsTrigger>
        </TabsList>
        <AnimatePresence mode="wait" initial={false}>
          {activeTab === "wallets" && (
            <motion.div
              key="wallets"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={tabVariants}
              transition={{ type: "spring", stiffness: 100, damping: 15 }}
            >
              <TabsContent value="wallets" className="mt-4">
                <WalletLeaderboard />
              </TabsContent>
            </motion.div>
          )}
          {activeTab === "confessions" && (
            <motion.div
              key="confessions"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={tabVariants}
              transition={{ type: "spring", stiffness: 100, damping: 15 }}
            >
              <TabsContent value="confessions" className="mt-4">
                <ConfessionLeaderboard />
              </TabsContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Tabs>
    </div>
  )
}

