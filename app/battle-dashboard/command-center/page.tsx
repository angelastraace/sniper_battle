import type { Metadata } from "next"
import BlockchainConnectionStatus from "@/components/blockchain-connection-status"

export const metadata: Metadata = {
  title: "Command Center | Battle Dashboard",
  description: "Centralized command and control for blockchain operations",
}

export default function CommandCenterPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-white">Command Center</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <BlockchainConnectionStatus />
        {/* Other command center components */}
      </div>
    </div>
  )
}
