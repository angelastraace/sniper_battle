import type React from "react"
import type { Metadata } from "next"
import BattleDashboardClient from "./BattleDashboardClient"

export const metadata: Metadata = {
  title: "Battle Dashboard | Ace Sniper",
  description: "Advanced blockchain monitoring and sniper system",
}

export default function BattleDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <BattleDashboardClient>{children}</BattleDashboardClient>
}
