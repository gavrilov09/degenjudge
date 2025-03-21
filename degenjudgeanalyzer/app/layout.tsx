import type React from "react"
import { Inter_Tight as InterTight, Inter } from "next/font/google"
import ClientLayout from "./client-layout"
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

// Add metadata export
export const metadata = {
  title: "DegenJudge.ai - Solana Wallet Analyzer",
  description: "Check how jeet you are with our Solana wallet analyzer",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${interTight.variable} ${inter.variable} font-inter`}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}



import './globals.css'