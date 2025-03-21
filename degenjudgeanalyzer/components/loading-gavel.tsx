"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"
import { Gavel } from "lucide-react"

const gavelVariants = {
  initial: { rotate: -30 },
  animate: {
    rotate: 30,
    transition: {
      duration: 0.8,
      repeat: Number.POSITIVE_INFINITY,
      repeatType: "reverse",
      ease: [0.4, 0, 0.6, 1],
    },
  },
}

const blockVariants = {
  initial: { scale: 1 },
  animate: {
    scale: [1, 0.95, 1],
    transition: {
      duration: 0.8,
      repeat: Number.POSITIVE_INFINITY,
      repeatType: "reverse",
      ease: [0.4, 0, 0.6, 1],
      times: [0, 0.5, 1],
    },
  },
}

const glowVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: [0, 0.6, 0],
    transition: {
      duration: 0.8,
      repeat: Number.POSITIVE_INFINITY,
      repeatType: "reverse",
      ease: [0.4, 0, 0.6, 1],
      times: [0, 0.5, 1],
    },
  },
}

const messages = [
  "The judge is reviewing your case",
  "Examining your trading history for paper hands",
  "Preparing your degen verdict",
  "Summoning the jury of crypto experts",
  "Court is in session, analyzing evidence",
]

export function LoadingGavel() {
  const [dots, setDots] = useState("")
  const [messageIndex] = useState(() => Math.floor(Math.random() * messages.length))

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => {
        switch (prev) {
          case "":
            return "."
          case ".":
            return ".."
          case "..":
            return "..."
          default:
            return ""
        }
      })
    }, 500)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-12">
        <div className="relative h-48 w-48">
          {/* Gavel handle and head */}
          <motion.div
            initial="initial"
            animate="animate"
            variants={gavelVariants}
            style={{ originX: 0.2, originY: 0.9 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <Gavel className="h-32 w-32 text-primary transform rotate-[45deg]" />
          </motion.div>

          {/* Gavel block */}
          <motion.div
            initial="initial"
            animate="animate"
            variants={blockVariants}
            className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-6 rounded-md bg-primary"
          />

          {/* Impact glow effect */}
          <motion.div
            initial="initial"
            animate="animate"
            variants={glowVariants}
            className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-32 h-32 rounded-full bg-primary/20 blur-xl"
          />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-3"
        >
          <h2 className="text-2xl text-primary font-bold">Order in the Court!</h2>
          <p className="text-xl text-primary/80 font-semibold">
            {messages[messageIndex]}
            {dots}
          </p>
        </motion.div>
      </div>
    </div>
  )
}

