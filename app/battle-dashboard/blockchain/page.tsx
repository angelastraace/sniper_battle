import type { Metadata } from "next"
import BlockchainStatusPage from "./blockchain-status-page"

export const metadata: Metadata = {
  title: "Blockchain Status | Ace Sniper Battle Station",
  description: "Blockchain connection status and monitoring",
}

export default function BlockchainPage() {
  return <BlockchainStatusPage />
}
