"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RefreshCw, AlertTriangle, CheckCircle, XCircle, Clock } from "lucide-react"
import { useBlockchainConnection, type NetworkType } from "@/lib/blockchain-connection-manager"

export default function BlockchainConnectionStatus() {
  const { status, errorMessages, responseTime, lastChecked, overallStatus, resetConnection } = useBlockchainConnection()

  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await Promise.all([resetConnection("ethereum"), resetConnection("solana"), resetConnection("bsc")])
    setIsRefreshing(false)
  }

  const formatTime = (timestamp: number) => {
    if (timestamp === 0) return "Never"
    const date = new Date(timestamp)
    return date.toLocaleTimeString()
  }

  const getStatusBadge = (network: NetworkType) => {
    const currentStatus = status[network]

    if (currentStatus === "connected") {
      return (
        <Badge variant="outline" className="bg-green-900/20 text-green-400 border-green-800 flex items-center gap-1">
          <CheckCircle size={12} />
          Connected
        </Badge>
      )
    } else if (currentStatus === "connecting") {
      return (
        <Badge variant="outline" className="bg-yellow-900/20 text-yellow-400 border-yellow-800 flex items-center gap-1">
          <Clock size={12} />
          Connecting
        </Badge>
      )
    } else {
      return (
        <Badge variant="outline" className="bg-red-900/20 text-red-400 border-red-800 flex items-center gap-1">
          <XCircle size={12} />
          Disconnected
        </Badge>
      )
    }
  }

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-blue-400">Blockchain Connection Status</CardTitle>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
          <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
          <span className="ml-2">Refresh</span>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Overall Status */}
          <div className="flex items-center justify-between p-4 rounded-lg bg-gray-800/50">
            <div className="flex items-center gap-2">
              {overallStatus === "healthy" ? (
                <CheckCircle className="text-green-500" size={24} />
              ) : overallStatus === "critical" ? (
                <AlertTriangle className="text-red-500" size={24} />
              ) : (
                <AlertTriangle className="text-amber-500" size={24} />
              )}
              <div>
                <div className="font-medium">Overall Status</div>
                <div className="text-sm text-gray-400">
                  {overallStatus === "healthy"
                    ? "All blockchain connections are active"
                    : overallStatus === "critical"
                      ? "All blockchain connections are down"
                      : "Some blockchain connections are active"}
                </div>
              </div>
            </div>
            <Badge
              variant="outline"
              className={`${
                overallStatus === "healthy"
                  ? "bg-green-900/20 text-green-400 border-green-800"
                  : overallStatus === "critical"
                    ? "bg-red-900/20 text-red-400 border-red-800"
                    : "bg-amber-900/20 text-amber-400 border-amber-800"
              }`}
            >
              {overallStatus === "healthy" ? "Healthy" : overallStatus === "critical" ? "Critical" : "Degraded"}
            </Badge>
          </div>

          {/* Individual Connections */}
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-md bg-gray-800/30">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-xs">ETH</div>
                <div>
                  <div className="font-medium">Ethereum</div>
                  <div className="text-xs text-gray-400">Mainnet</div>
                </div>
              </div>
              {getStatusBadge("ethereum")}
            </div>

            <div className="flex items-center justify-between p-3 rounded-md bg-gray-800/30">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-xs">SOL</div>
                <div>
                  <div className="font-medium">Solana</div>
                  <div className="text-xs text-gray-400">Mainnet</div>
                </div>
              </div>
              {getStatusBadge("solana")}
            </div>

            <div className="flex items-center justify-between p-3 rounded-md bg-gray-800/30">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-yellow-600 flex items-center justify-center text-xs">BNB</div>
                <div>
                  <div className="font-medium">Binance Smart Chain</div>
                  <div className="text-xs text-gray-400">Mainnet</div>
                </div>
              </div>
              {getStatusBadge("bsc")}
            </div>
          </div>

          <div className="text-xs text-gray-500 text-right">
            Last updated: {formatTime(Math.max(...Object.values(lastChecked)))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
