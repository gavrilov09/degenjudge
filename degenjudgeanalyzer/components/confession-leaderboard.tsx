"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ThumbsUp, ThumbsDown, Gavel, Scale } from "lucide-react"
import { Medal } from "@/components/ui/medal"

type Confession = {
  id: number
  nickname: string
  content: string
  likes: number
  dislikes: number
  timestamp: number
}

const getWeeklyConfessions = (confessions: Confession[]) => {
  const now = new Date()
  const lastMonday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() + 1)
  lastMonday.setHours(0, 0, 0, 0)
  return confessions.filter((confession) => confession.timestamp >= lastMonday.getTime())
}

export function ConfessionLeaderboard() {
  const [selectedConfession, setSelectedConfession] = useState<Confession | null>(null)
  const [weeklyConfessions, setWeeklyConfessions] = useState<Confession[]>([])

  useEffect(() => {
    // In a real application, you would fetch the confessions from your backend or local storage
    const fetchConfessions = () => {
      const storedConfessions = localStorage.getItem("confessions")
      if (storedConfessions) {
        const allConfessions: Confession[] = JSON.parse(storedConfessions)
        const weekly = getWeeklyConfessions(allConfessions)
        setWeeklyConfessions(weekly.sort((a, b) => b.likes - a.likes).slice(0, 10))
      }
    }

    fetchConfessions()
    const interval = setInterval(fetchConfessions, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [])

  return (
    <>
      <Card className="court-card rounded-component">
        <div className="court-header">
          <h2 className="text-xl font-medium text-primary flex items-center">
            <Gavel className="h-6 w-6 mr-2" />
            Degen Court: Top Weekly Confessions
          </h2>
        </div>
        <div className="court-content space-y-4">
          {weeklyConfessions.map((confession, index) => (
            <div
              key={confession.id}
              onClick={() => setSelectedConfession(confession)}
              className="flex items-center justify-between p-4 bg-secondary/80 rounded-lg text-foreground cursor-pointer hover:bg-secondary transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-8 text-center">
                  {index < 3 ? (
                    <Medal
                      className={`h-6 w-6 ${
                        index === 0 ? "text-yellow-500" : index === 1 ? "text-zinc-400" : "text-amber-600"
                      }`}
                    />
                  ) : (
                    <span className="text-muted-foreground font-semibold">{index + 1}</span>
                  )}
                </div>
                <span className="font-medium">{confession.nickname}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <ThumbsUp className="h-4 w-4 text-green-500" />
                  <span>{confession.likes}</span>
                </div>
                <div className="flex items-center gap-1">
                  <ThumbsDown className="h-4 w-4 text-red-500" />
                  <span>{confession.dislikes}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Dialog open={!!selectedConfession} onOpenChange={() => setSelectedConfession(null)}>
        <DialogContent className="court-card">
          <DialogHeader>
            <DialogTitle className="text-xl font-medium text-primary">
              Case File: {selectedConfession?.nickname}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-primary" />
              <p className="text-lg font-semibold">Confession:</p>
            </div>
            <p className="text-foreground bg-secondary/80 p-4 rounded-lg">{selectedConfession?.content}</p>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Time of Confession: {selectedConfession && new Date(selectedConfession.timestamp).toLocaleString()}
              </span>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <ThumbsUp className="h-4 w-4 text-green-500" />
                  <span>{selectedConfession?.likes}</span>
                </div>
                <div className="flex items-center gap-1">
                  <ThumbsDown className="h-4 w-4 text-red-500" />
                  <span>{selectedConfession?.dislikes}</span>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

