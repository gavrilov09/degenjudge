import Link from "next/link"
import { Gavel } from "lucide-react"

export function Logo() {
  return (
    <div className="flex items-center gap-3">
      <Link href="/" className="text-xl font-bold tracking-tight flex items-center gap-2">
        <Gavel className="h-6 w-6 text-primary" />
        <span className="font-inter-tight text-primary">DegenJudge.ai</span>
      </Link>
      <span className="inline-flex items-center rounded-full bg-destructive px-2.5 py-0.5 text-xs font-medium text-destructive-foreground">
        BETA
      </span>
    </div>
  )
}

