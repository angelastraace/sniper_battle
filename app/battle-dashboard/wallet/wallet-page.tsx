"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"
import { useBlockchainConnection } from "@/lib/blockchain-connection-manager"
import { walletStorage } from "@/lib/wallet-storage"
import WalletManagement from "./wallet-management"

export default function WalletPage() {
  const [activeTab, setActiveTab] = useState("ethereum")
  const { status } = useBlockchainConnection()

  // Get wallet info from storage
  const wallets = walletStorage.getWallets()

  return (
    <div className="container mx-auto p-4">
      <WalletManagement />
    </div>
  )
}

// Recent Transactions component
function RecentTransactions({ network }: { network: string }) {
  const { status } = useBlockchainConnection()

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
      </CardHeader>
      <CardContent>
        {status[network as "ethereum" | "solana" | "bsc"] !== "connected" ? (
          <div className="flex items-center justify-center text-red-400 py-4">
            <AlertTriangle className="h-5 w-5 mr-2" />
            <span>Network disconnected</span>
          </div>
        ) : (
          <div className="text-center p-4 text-gray-500">No transactions found</div>
        )}
      </CardContent>
    </Card>
  )
}
