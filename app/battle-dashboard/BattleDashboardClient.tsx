"use client"

import type React from "react"
import MainNavigation from "@/components/main-navigation"
import ScrollToTop from "@/components/scroll-to-top"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"
import { Command } from "lucide-react"

export default function BattleDashboardClient({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-black text-white flex flex-col md:flex-row">
      <MainNavigation>
        <Link
          href="/battle-dashboard/control-center"
          className={cn(
            "flex items-center gap-2 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50",
            pathname === "/battle-dashboard/control-center" &&
              "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-gray-50",
          )}
        >
          <Command className="h-4 w-4" />
          Control Center
        </Link>
      </MainNavigation>
      <div className="flex-1 md:ml-64 w-full overflow-y-auto max-h-screen">
        {children}
        <ScrollToTop />
      </div>
    </div>
  )
}
