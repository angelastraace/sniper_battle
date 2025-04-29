"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import WalletStatus from "@/components/wallet-status"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"
import { useBlockchainConnection } from "@/lib/blockchain-connection-manager"
import { config } from "@/lib/config"
import { walletStorage } from "@/lib/wallet-storage"

export default function WalletPage() {
  const [activeTab, setActiveTab] = useState("ethereum")
  const { status } = useBlockchainConnection()

  // Get wallet info from storage
  const wallets = walletStorage.getWallets()

  return (
    <div className="p-6 space-y-6 pb-20">
      <h1 className="text-3xl font-bold text-white mb-6">Wallet Management</h1>

      <Tabs defaultValue="ethereum" className="w-full" onValueChange={(value) => setActiveTab(value)}>
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="ethereum">Ethereum</TabsTrigger>
          <TabsTrigger value="solana">Solana</TabsTrigger>
          <TabsTrigger value="bsc">BSC</TabsTrigger>
        </TabsList>

        <TabsContent value="ethereum">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <WalletStatus
              network="ethereum"
              address={wallets.ethereum.address || config.destinationWallets.ethereum || ""}
              privateKey={wallets.ethereum.privateKey || ""}
              explorerUrl="https://etherscan.io/address/"
            />
            <RecentTransactions network="ethereum" />
          </div>
        </TabsContent>

        <TabsContent value="solana">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <WalletStatus
              network="solana"
              address={wallets.solana.address || config.destinationWallets.solana || ""}
              privateKey={wallets.solana.privateKey || ""}
              explorerUrl="https://solscan.io/account/"
            />
            <RecentTransactions network="solana" />
          </div>
        </TabsContent>

        <TabsContent value="bsc">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <WalletStatus
              network="bsc"
              address={wallets.bsc.address || config.destinationWallets.bsc || ""}
              privateKey={wallets.bsc.privateKey || ""}
              explorerUrl="https://bscscan.com/address/"
            />
            <RecentTransactions network="bsc" />
          </div>
        </TabsContent>
      </Tabs>
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
