import { ParticleBackground } from "./particle-background"

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 z-0 bg-[#0f0f1a] overflow-hidden min-h-screen">
      <ParticleBackground />
      <div className="absolute inset-0 min-h-screen bg-[#0f0f1a] opacity-60"></div>
    </div>
  )
}

