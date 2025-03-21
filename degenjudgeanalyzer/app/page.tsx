import type { Metadata } from "next"
import { Search } from "@/components/search"
import { Navigation } from "@/components/navigation"
import { SocialLinks } from "@/components/social-links"
import { ContractAddress } from "@/components/contract-address"
import { AnimatedBackground } from "@/components/animated-background"
import { PageTransition } from "@/components/page-transition"
import { Gavel } from "lucide-react"

export const metadata: Metadata = {
  title: "DegenJudge.ai - Solana Wallet Analyzer",
  description: "placeholder",
}

export default function Home() {
  return (
    <PageTransition>
      <main className="min-h-screen relative overflow-hidden">
        <AnimatedBackground />
        <div className="relative z-10 px-4">
          <div className="container mx-auto min-h-screen flex flex-col">
            <Navigation />
            <div className="flex-1 flex flex-col items-center justify-center max-w-3xl mx-auto w-full text-center gap-8 -mt-16">
              <div className="space-y-4">
                <div className="flex items-center justify-center mb-4">
                  <Gavel className="h-16 w-16 text-primary mr-4" />
                  <h1 className="text-4xl md:text-5xl font-medium tracking-tight bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-500 text-transparent bg-clip-text py-2 leading-relaxed">
                    DegenJudge.ai
                  </h1>
                </div>
                <p className="text-lg text-muted-foreground">Your trades are on trial. The blockchain never forgets.</p>
              </div>
              <Search />
            </div>
            <SocialLinks />
          </div>
        </div>
        <ContractAddress />
      </main>
    </PageTransition>
  )
}

