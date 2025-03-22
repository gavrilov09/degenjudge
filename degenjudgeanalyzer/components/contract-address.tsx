"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export function ContractAddress() {
  const [copied, setCopied] = useState(false)
  const contractAddress = "test"

  useEffect(() => {
    let timeout: NodeJS.Timeout
    if (copied) {
      timeout = setTimeout(() => setCopied(false), 2000)
    }
    return () => clearTimeout(timeout)
  }, [copied])

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(contractAddress)
      setCopied(true)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  return (
    <div className="fixed bottom-8 left-8 rounded-lg p-[1px] bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-500 z-50 shadow-[0_0_15px_rgba(255,215,0,0.3)]">
      <div className="bg-card border-0 rounded-lg p-4 flex items-center space-x-4 w-full">
        <div className="flex-grow overflow-hidden">
          <p className="text-xs text-muted-foreground">Contract Address</p>
          <p className="text-sm font-medium text-primary truncate select-all">{contractAddress}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={copyToClipboard}
          className="h-8 w-8 rounded-full transition-all duration-300 ease-in-out hover:bg-primary/20 z-10"
        >
          <AnimatePresence mode="wait" initial={false}>
            {copied ? (
              <motion.div
                key="check"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Check className="h-4 w-4 text-green-500" />
              </motion.div>
            ) : (
              <motion.div
                key="copy"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Copy className="h-4 w-4 text-primary" />
              </motion.div>
            )}
          </AnimatePresence>
          <span className="sr-only">{copied ? "Copied" : "Copy contract address"}</span>
        </Button>
      </div>
    </div>
  )
}

