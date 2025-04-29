import type { Metadata } from "next"
import BattleDashboardClientPage from "./BattleDashboardClientPage"

export const metadata: Metadata = {
  title: "Battle Dashboard | Advanced Blockchain Scanner",
  description: "High-performance multi-chain scanning and monitoring dashboard",
}

export default function BattleDashboardPage() {
  return <BattleDashboardClientPage />
}
