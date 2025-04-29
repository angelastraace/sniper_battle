import type { Metadata } from "next"
import AnalyticsPage from "./analytics-page"

export const metadata: Metadata = {
  title: "Analytics | Ace Sniper Battle Station",
  description: "Advanced analytics for blockchain operations",
}

export default function Analytics() {
  return <AnalyticsPage />
}
