"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function Search() {
  const [address, setAddress] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!address) return

    setIsLoading(true)
    router.push(`/results/${address}`)
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-xl space-y-4">
      <div className="relative">
        <Input
          type="text"
          placeholder="Enter Solana wallet address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full bg-secondary/50 border-primary/50 text-foreground placeholder:text-muted-foreground pr-12 h-14"
        />
        <Button
          type="submit"
          size="sm"
          variant="ghost"
          className="absolute right-2 top-1/2 -translate-y-1/2 text-primary hover:text-primary hover:bg-primary/20"
          disabled={isLoading}
        >
          {isLoading ? (
            <RefreshCw className="h-5 w-5 animate-spin" />
          ) : (
            <ArrowRight className="h-5 w-5 transition-colors duration-200" />
          )}
        </Button>
      </div>
    </form>
  )
}

