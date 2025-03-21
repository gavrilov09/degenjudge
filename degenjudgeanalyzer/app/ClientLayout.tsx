"use client"

import type React from "react"

import { Inter_Tight as InterTight, Inter } from "next/font/google"
import { AnimatePresence } from "framer-motion"
import "./globals.css"

// Import Inter Tight from Google Fonts
const interTight = InterTight({
  weight: "500",
  subsets: ["latin"],
  variable: "--font-inter-tight",
})

// Use Inter for body text instead of Switzer
const inter = Inter({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-inter",
})

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${interTight.variable} ${inter.variable} font-inter`}>
        <AnimatePresence mode="wait">{children}</AnimatePresence>
      </body>
    </html>
  )
}

