import type { Metadata } from "next"
import SniperControlPage from "./sniper-control-page"

export const metadata: Metadata = {
  title: "Sniper Control | Ace Sniper Battle Station",
  description: "Advanced sniper control system for blockchain operations",
}

export default function SniperPage() {
  return <SniperControlPage />
}
