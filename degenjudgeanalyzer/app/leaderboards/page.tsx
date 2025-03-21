import { Navigation } from "@/components/navigation"
import { SocialLinks } from "@/components/social-links"
import { ContractAddress } from "@/components/contract-address"
import { AnimatedBackground } from "@/components/animated-background"
import { LeaderboardTabs } from "@/components/leaderboard-tabs"
import { PageTransition } from "@/components/page-transition"

export default function LeaderboardsPage() {
  return (
    <PageTransition>
      <main className="min-h-screen relative overflow-hidden">
        <AnimatedBackground />
        <div className="relative z-10 px-4">
          <div className="container mx-auto min-h-screen flex flex-col">
            <Navigation />
            <div className="flex-1 flex flex-col items-center justify-center w-full py-8">
              <LeaderboardTabs />
            </div>
            <SocialLinks />
          </div>
        </div>
        <ContractAddress />
      </main>
    </PageTransition>
  )
}

