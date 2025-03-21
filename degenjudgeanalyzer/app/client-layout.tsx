"use client"

import type React from "react"
import { AnimatePresence } from "framer-motion"

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AnimatePresence mode="wait">{children}</AnimatePresence>
}

