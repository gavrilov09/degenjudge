import { Navigation } from "@/components/navigation"
import { SocialLinks } from "@/components/social-links"
import { ContractAddress } from "@/components/contract-address"
import { AnimatedBackground } from "@/components/animated-background"
import { PageTransition } from "@/components/page-transition"
import { Suspense } from "react"
import { WalletResults } from "@/components/wallet-results"
import { WalletResultsSkeleton } from "@/components/wallet-results-skeleton"

export default function ResultsPage({ params }: { params: { address: string } }) {
  return (
    <PageTransition>
      <main className="min-h-screen relative overflow-hidden">
        <AnimatedBackground />
        <div className="relative z-10 px-4">
          <div className="container mx-auto min-h-screen flex flex-col">
            <Navigation />
            <div className="flex-1 flex flex-col w-full py-8">
              <Suspense fallback={<WalletResultsSkeleton />}>
                <WalletResults address={params.address} />
              </Suspense>
            </div>
            <SocialLinks />
          </div>
        </div>
        <ContractAddress />
      </main>
    </PageTransition>
  )
}

