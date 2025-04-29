"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useBlockchainConnection, type NetworkType } from "@/lib/blockchain-connection-manager"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

export default function BlockchainStatus() {
  const { status, errorMessages, lastChecked, resetConnection } = useBlockchainConnection()
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

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-blue-400">Blockchain Connections</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="h-8 px-2 text-xs"
        >
          <RefreshCw size={14} className={isRefreshing ? "mr-1 animate-spin" : "mr-1"} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent className="space-y-0">
        {(["ethereum", "solana", "bsc"] as NetworkType[]).map((network) => (
          <div key={network} className="flex items-center justify-between py-3 border-b border-gray-800 last:border-0">
            <div className="capitalize">{network}</div>
            <div className="flex items-center">
              <div
                className={`w-2 h-2 rounded-full mr-2 ${
                  status[network] === "connected"
                    ? "bg-green-500"
                    : status[network] === "connecting"
                      ? "bg-yellow-500"
                      : "bg-red-500"
                }`}
              />
              <div
                className={`text-sm ${
                  status[network] === "connected"
                    ? "text-green-500"
                    : status[network] === "connecting"
                      ? "text-yellow-500"
                      : "text-red-500"
                }`}
              >
                {status[network] === "connected" ? "Connected" : "Disconnected"}
              </div>
            </div>
          </div>
        ))}
        <div className="text-xs text-gray-500 text-right pt-2">
          Last updated: {formatTime(Math.max(...Object.values(lastChecked)))}
        </div>
      </CardContent>
    </Card>
  )
}
