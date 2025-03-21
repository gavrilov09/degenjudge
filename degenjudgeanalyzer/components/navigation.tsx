"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Logo } from "./logo"

const navigation = [
  { name: "Wallet Analyzer", href: "/" },
  { name: "Confession Board", href: "/confessions" },
  { name: "Leaderboards", href: "/leaderboards" },
]

const navVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
}

const linkVariants = {
  hover: { scale: 1.05, transition: { type: "spring", stiffness: 400, damping: 10 } },
}

export function Navigation() {
  const pathname = usePathname()

  return (
    <motion.header
      className="w-full court-card rounded-lg mt-4"
      initial="hidden"
      animate="visible"
      variants={navVariants}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <div className="flex items-center justify-between py-4 px-6">
        <Logo />
        <nav className="flex justify-center">
          <div className="flex space-x-1 rounded-lg bg-secondary p-1 backdrop-blur-sm">
            {navigation.map((item) => (
              <motion.div key={item.name} variants={linkVariants} whileHover="hover">
                <Link
                  href={item.href}
                  className={cn(
                    "px-4 py-2 text-sm font-medium rounded-md transition-colors",
                    pathname === item.href
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-primary hover:bg-primary/20",
                  )}
                >
                  {item.name}
                </Link>
              </motion.div>
            ))}
          </div>
        </nav>
      </div>
    </motion.header>
  )
}

