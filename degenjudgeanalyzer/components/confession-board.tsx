"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ThumbsUp, ThumbsDown, Gavel, AlertTriangle, Clock } from "lucide-react"

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

const confirmationVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 200,
      damping: 20,
    },
  },
}

type Confession = {
  id: number
  nickname: string
  walletAddress: string
  content: string
  likes: number
  dislikes: number
  liked: boolean
  disliked: boolean
  timestamp: number
}

const getWeeklyConfessions = (confessions: Confession[]) => {
  const now = new Date()
  const lastMonday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay() + 1)
  lastMonday.setHours(0, 0, 0, 0)
  return confessions.filter((confession) => confession.timestamp >= lastMonday.getTime())
}

const COOLDOWN_DURATION = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

export function ConfessionBoard() {
  const [filter, setFilter] = useState<"recent" | "top-weekly" | "top-monthly" | "top-all-time">("recent")
  const [activeTab, setActiveTab] = useState("confess")
  const [confessions, setConfessions] = useState<Confession[]>([])
  const [nickname, setNickname] = useState("")
  const [walletAddress, setWalletAddress] = useState("")
  const [confessionContent, setConfessionContent] = useState("")
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [cooldownEndTime, setCooldownEndTime] = useState<number | null>(null)
  const [remainingTime, setRemainingTime] = useState<string>("")

  useEffect(() => {
    const storedConfessions = localStorage.getItem("confessions")
    if (storedConfessions) {
      setConfessions(JSON.parse(storedConfessions))
    }

    const storedCooldownEndTime = localStorage.getItem("cooldownEndTime")
    if (storedCooldownEndTime) {
      setCooldownEndTime(Number.parseInt(storedCooldownEndTime, 10))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("confessions", JSON.stringify(confessions))
  }, [confessions])

  useEffect(() => {
    if (cooldownEndTime) {
      localStorage.setItem("cooldownEndTime", cooldownEndTime.toString())
      const interval = setInterval(() => {
        const now = Date.now()
        if (now >= cooldownEndTime) {
          setCooldownEndTime(null)
          setRemainingTime("")
          clearInterval(interval)
        } else {
          const timeLeft = cooldownEndTime - now
          const hours = Math.floor(timeLeft / (60 * 60 * 1000))
          const minutes = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000))
          const seconds = Math.floor((timeLeft % (60 * 1000)) / 1000)
          setRemainingTime(
            `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`,
          )
        }
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [cooldownEndTime])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!nickname || !walletAddress || !confessionContent) return

    const newConfession: Confession = {
      id: Date.now(),
      nickname,
      walletAddress,
      content: confessionContent,
      likes: 0,
      dislikes: 0,
      liked: false,
      disliked: false,
      timestamp: Date.now(),
    }

    setConfessions((prev) => [newConfession, ...prev])
    setShowConfirmation(true)
    setCooldownEndTime(Date.now() + COOLDOWN_DURATION)

    setTimeout(() => {
      setShowConfirmation(false)
      setNickname("")
      setWalletAddress("")
      setConfessionContent("")
    }, 3000)
  }

  const toggleReaction = (id: number, type: "like" | "dislike") => {
    setConfessions((prevConfessions) =>
      prevConfessions.map((confession) => {
        if (confession.id === id) {
          if (type === "like") {
            return {
              ...confession,
              likes: confession.liked ? confession.likes - 1 : confession.likes + 1,
              liked: !confession.liked,
              disliked: false,
              dislikes: confession.disliked ? confession.dislikes - 1 : confession.dislikes,
            }
          } else {
            return {
              ...confession,
              dislikes: confession.disliked ? confession.dislikes - 1 : confession.dislikes + 1,
              disliked: !confession.disliked,
              liked: false,
              likes: confession.liked ? confession.likes - 1 : confession.likes,
            }
          }
        }
        return confession
      }),
    )
  }

  const filteredConfessions = () => {
    const now = Date.now()
    const oneMonth = 30 * 24 * 60 * 60 * 1000

    switch (filter) {
      case "recent":
        return [...confessions].sort((a, b) => b.timestamp - a.timestamp)
      case "top-weekly":
        return getWeeklyConfessions(confessions).sort((a, b) => b.likes - a.likes)
      case "top-monthly":
        return [...confessions].filter((c) => now - c.timestamp < oneMonth).sort((a, b) => b.likes - a.likes)
      case "top-all-time":
        return [...confessions].sort((a, b) => b.likes - a.likes)
      default:
        return confessions
    }
  }

  return (
    <Card className="w-full max-w-3xl court-card rounded-component mt-8 mb-8">
      <CardHeader className="court-header">
        <CardTitle className="text-primary flex items-center">
          <Gavel className="h-6 w-6 mr-2" />
          Confession Board
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Share your trading secrets or browse others' confessions
        </CardDescription>
      </CardHeader>
      <CardContent className="court-content">
        <Tabs defaultValue="confess" className="mt-6" onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 bg-secondary/50 p-1">
            <TabsTrigger
              value="confess"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300 hover:scale-105"
            >
              Make a Confession
            </TabsTrigger>
            <TabsTrigger
              value="browse"
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all duration-300 hover:scale-105"
            >
              Browse Confessions
            </TabsTrigger>
          </TabsList>
          <AnimatePresence mode="wait">
            {activeTab === "confess" && (
              <motion.div
                key="confess"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={tabVariants}
                transition={{ duration: 0.3 }}
              >
                <TabsContent value="confess" className="mt-6">
                  <AnimatePresence mode="wait">
                    {!cooldownEndTime ? (
                      !showConfirmation ? (
                        <motion.form
                          key="confession-form"
                          onSubmit={handleSubmit}
                          className="space-y-4"
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          variants={confirmationVariants}
                        >
                          <Input
                            placeholder="Your Nickname"
                            value={nickname}
                            onChange={(e) => setNickname(e.target.value)}
                            className="bg-secondary/50 border-primary/50 text-foreground placeholder:text-muted-foreground"
                          />
                          <Input
                            placeholder="Your Solana Wallet Address"
                            value={walletAddress}
                            onChange={(e) => setWalletAddress(e.target.value)}
                            className="bg-secondary/50 border-primary/50 text-foreground placeholder:text-muted-foreground"
                          />
                          <Textarea
                            placeholder="Your confession..."
                            value={confessionContent}
                            onChange={(e) => setConfessionContent(e.target.value)}
                            className="bg-secondary/50 border-primary/50 text-foreground placeholder:text-muted-foreground"
                          />
                          <Button type="submit" className="court-button">
                            Submit Confession
                          </Button>
                        </motion.form>
                      ) : (
                        <motion.div
                          key="confirmation"
                          className="bg-secondary/90 border-primary text-foreground p-6 rounded-lg"
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                          variants={confirmationVariants}
                        >
                          <div className="flex items-center mb-4">
                            <AlertTriangle className="h-6 w-6 mr-2 text-yellow-500" />
                            <h3 className="text-xl font-bold text-primary">Confession Submitted!</h3>
                          </div>
                          <p className="text-lg">
                            Your degen secrets are now on the blockchain! The DegenJudge has noted your confession. May
                            the odds be ever in your favor!
                          </p>
                        </motion.div>
                      )
                    ) : (
                      <motion.div
                        key="cooldown"
                        className="bg-secondary/90 border-primary text-foreground p-6 rounded-lg"
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        variants={confirmationVariants}
                      >
                        <div className="flex items-center mb-4">
                          <Clock className="h-6 w-6 mr-2 text-primary" />
                          <h3 className="text-xl font-bold text-primary">Confession Cooldown</h3>
                        </div>
                        <p className="text-lg mb-4">
                          You must wait before submitting another confession. This helps prevent spam and ensures fair
                          participation.
                        </p>
                        <div className="text-center">
                          <p className="text-3xl font-bold text-primary">{remainingTime}</p>
                          <p className="text-sm text-muted-foreground">Time remaining</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </TabsContent>
              </motion.div>
            )}
            {activeTab === "browse" && (
              <motion.div
                key="browse"
                initial="hidden"
                animate="visible"
                exit="exit"
                variants={tabVariants}
                transition={{ duration: 0.3 }}
              >
                <TabsContent value="browse" className="mt-6">
                  <div className="space-y-4">
                    <div className="flex justify-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setFilter("recent")}
                        className={`border-primary/50 transition-all duration-200 ${
                          filter === "recent"
                            ? "bg-primary/20 text-primary hover:bg-primary/20 hover:text-primary"
                            : "bg-secondary/50 text-muted-foreground hover:bg-primary/20 hover:text-primary"
                        }`}
                      >
                        Recent
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setFilter("top-weekly")}
                        className={`border-primary/50 transition-all duration-200 ${
                          filter === "top-weekly"
                            ? "bg-primary/20 text-primary hover:bg-primary/20 hover:text-primary"
                            : "bg-secondary/50 text-muted-foreground hover:bg-primary/20 hover:text-primary"
                        }`}
                      >
                        Top Weekly
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setFilter("top-monthly")}
                        className={`border-primary/50 transition-all duration-200 ${
                          filter === "top-monthly"
                            ? "bg-primary/20 text-primary hover:bg-primary/20 hover:text-primary"
                            : "bg-secondary/50 text-muted-foreground hover:bg-primary/20 hover:text-primary"
                        }`}
                      >
                        Top Monthly
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setFilter("top-all-time")}
                        className={`border-primary/50 transition-all duration-200 ${
                          filter === "top-all-time"
                            ? "bg-primary/20 text-primary hover:bg-primary/20 hover:text-primary"
                            : "bg-secondary/50 text-muted-foreground hover:bg-primary/20 hover:text-primary"
                        }`}
                      >
                        All Time
                      </Button>
                    </div>
                    <ScrollArea className="h-[calc(100vh-400px)] pr-4">
                      <div className="space-y-4">
                        {filteredConfessions().map((confession) => (
                          <Card key={confession.id} className="bg-secondary/80 border-primary/50 text-foreground">
                            <CardHeader>
                              <CardTitle className="text-primary">{confession.nickname}</CardTitle>
                              <CardDescription className="text-muted-foreground">
                                {new Date(confession.timestamp).toLocaleString()}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <p>{confession.content}</p>
                            </CardContent>
                            <CardFooter className="space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className={`bg-secondary/50 text-muted-foreground hover:text-primary hover:bg-primary/20 transition-all duration-200 ${
                                  confession.liked ? "bg-green-500/20 text-green-500" : ""
                                }`}
                                onClick={() => toggleReaction(confession.id, "like")}
                              >
                                <ThumbsUp className={`w-4 h-4 mr-2 ${confession.liked ? "animate-pulse" : ""}`} />
                                Like ({confession.likes})
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className={`bg-secondary/50 text-muted-foreground hover:text-primary hover:bg-primary/20 transition-all duration-200 ${
                                  confession.disliked ? "bg-red-500/20 text-red-500" : ""
                                }`}
                                onClick={() => toggleReaction(confession.id, "dislike")}
                              >
                                <ThumbsDown className={`w-4 h-4 mr-2 ${confession.disliked ? "animate-pulse" : ""}`} />
                                Dislike ({confession.dislikes})
                              </Button>
                            </CardFooter>
                          </Card>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                </TabsContent>
              </motion.div>
            )}
          </AnimatePresence>
        </Tabs>
      </CardContent>
    </Card>
  )
}

