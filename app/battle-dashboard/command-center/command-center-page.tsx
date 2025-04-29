"use client"

import { useEffect, useState } from "react"
import BlockchainConnectionStatus from "@/components/blockchain-connection-status"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useBlockchainConnection } from "@/lib/blockchain-connection-manager"
import { Badge } from "@/components/ui/badge"
import {
  getBlockchainStatus,
  getSolanaSignatures,
  getEthereumTransactions,
  getBSCTransactions,
} from "@/lib/blockchain-utils"
import BlockchainApiService from "@/lib/blockchain-api-service"

export default function CommandCenterPage() {
  const { overallStatus } = useBlockchainConnection()
  const [systemStatus, setSystemStatus] = useState({
    cpu: Math.floor(Math.random() * 30) + 10, // 10-40%
    memory: Math.floor(Math.random() * 40) + 20, // 20-60%
    disk: Math.floor(Math.random() * 30) + 5, // 5-35%
    network: Math.floor(Math.random() * 50) + 10, // 10-60%
  })
  const [blockchainStatus, setBlockchainStatus] = useState<any>({
    solana: { status: "loading" },
    ethereum: { status: "loading" },
    bsc: { status: "loading" },
    timestamp: new Date().toISOString(),
  })

  const [solanaTransactions, setSolanaTransactions] = useState<any[]>([])
  const [ethereumTransactions, setEthereumTransactions] = useState<any[]>([])
  const [bscTransactions, setBscTransactions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState({
    ethereum: false,
    solana: false,
    bsc: false,
  })

  // Destination wallets from environment variables
  const destinationWalletETH = process.env.DESTINATION_WALLET_ETH || "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
  const destinationWalletSOL = process.env.DESTINATION_WALLET_SOL || "EXnGBBSamqzd3uxEdRLUiYzjJkTwQyorAaFXdfteuGXe"
  const destinationWalletBNB = process.env.DESTINATION_WALLET_BNB || "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"

  useEffect(() => {
    // Get blockchain service instance
    const blockchainService = BlockchainApiService.getInstance()

    // Set up interval to check connection status
    const statusInterval = setInterval(() => {
      setConnectionStatus(blockchainService.getConnectionStatus())
    }, 5000)

    fetchData()

    // Set up auto-refresh every 30 seconds
    const refreshInterval = setInterval(() => {
      fetchData(false) // Don't show loading indicator for auto-refresh
    }, 30000)

    return () => {
      clearInterval(statusInterval)
      clearInterval(refreshInterval)
    }
  }, [])

  useEffect(() => {
    // Simulate system metrics changing
    const interval = setInterval(() => {
      setSystemStatus({
        cpu: Math.min(Math.max(systemStatus.cpu + (Math.random() * 10 - 5), 5), 95),
        memory: Math.min(Math.max(systemStatus.memory + (Math.random() * 8 - 4), 10), 90),
        disk: Math.min(Math.max(systemStatus.disk + (Math.random() * 2 - 1), 5), 95),
        network: Math.min(Math.max(systemStatus.network + (Math.random() * 15 - 7.5), 5), 95),
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [systemStatus])

  const fetchData = async (showLoading = true) => {
    if (showLoading) {
      setIsLoading(true)
    }
    setRefreshing(true)

    try {
      // Fetch blockchain status
      const status = await getBlockchainStatus()

      // Update status with connection status from service
      const blockchainService = BlockchainApiService.getInstance()
      const connStatus = blockchainService.getConnectionStatus()

      status.ethereum.status = connStatus.ethereum ? "online" : "offline"
      status.solana.status = connStatus.solana ? "online" : "offline"
      status.bsc.status = connStatus.bsc ? "online" : "offline"

      setBlockchainStatus(status)
      setConnectionStatus(connStatus)

      // Fetch transactions in parallel
      const [solTxs, ethTxs, bscTxs] = await Promise.all([
        connStatus.solana
          ? getSolanaSignatures(destinationWalletSOL, 5).catch((err) => {
              console.error("Error fetching Solana signatures:", err)
              return []
            })
          : [],
        connStatus.ethereum
          ? getEthereumTransactions(destinationWalletETH, 5).catch((err) => {
              console.error("Error fetching Ethereum transactions:", err)
              return []
            })
          : [],
        connStatus.bsc
          ? getBSCTransactions(destinationWalletBNB, 5).catch((err) => {
              console.error("Error fetching BSC transactions:", err)
              return []
            })
          : [],
      ])

      setSolanaTransactions(solTxs)
      setEthereumTransactions(ethTxs)
      setBscTransactions(bscTxs)
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      if (showLoading) {
        setIsLoading(false)
      }
      setRefreshing(false)
    }
  }

  const formatTime = (timestamp: number) => {
    if (!timestamp) return "Unknown"
    return new Date(timestamp * 1000).toLocaleString()
  }

  const truncateHash = (hash: string) => {
    if (!hash) return "Unknown"
    return `${hash.substring(0, 6)}...${hash.substring(hash.length - 4)}`
  }

  const getStatusBadge = (status: string) => {
    if (status === "online") {
      return <Badge className="bg-green-500">Online</Badge>
    } else if (status === "mocked") {
      return <Badge className="bg-yellow-500">Fallback</Badge>
    } else if (status === "loading") {
      return <Badge className="bg-blue-500">Loading</Badge>
    } else {
      return <Badge className="bg-red-500">Offline</Badge>
    }
  }

  const solanaStatus = blockchainStatus.solana
  const ethereumStatus = blockchainStatus.ethereum
  const bscStatus = blockchainStatus.bsc

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-white">Command Center</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <BlockchainConnectionStatus />

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-purple-400">System Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-400">CPU Usage</span>
                  <span className="text-sm text-gray-400">{systemStatus.cpu.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${systemStatus.cpu}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-400">Memory Usage</span>
                  <span className="text-sm text-gray-400">{systemStatus.memory.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${systemStatus.memory}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-400">Disk Usage</span>
                  <span className="text-sm text-gray-400">{systemStatus.disk.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${systemStatus.disk}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm text-gray-400">Network Usage</span>
                  <span className="text-sm text-gray-400">{systemStatus.network.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${systemStatus.network}%` }}></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-blue-400">Active Operations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">No active operations</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-green-400">Recent Profits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">No recent profits</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-amber-400">System Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {overallStatus !== "healthy" && (
                <div className="p-2 bg-red-900/20 border border-red-800 rounded-md text-sm">
                  Blockchain connection issues detected
                </div>
              )}
              <div className="text-center py-6 text-gray-500">
                {overallStatus === "healthy" ? "No active alerts" : ""}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
