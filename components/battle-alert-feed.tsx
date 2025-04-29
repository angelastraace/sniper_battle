"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"
import { AlertTriangle, CheckCircle, Info } from "lucide-react"
import { BlockchainService } from "@/lib/blockchain-service"

interface Alert {
  id: string
  type: "warning" | "success" | "info"
  message: string
  timestamp: number
}

export default function BattleAlertFeed() {
  const [alerts, setAlerts] = useState<Alert[]>([])

  useEffect(() => {
    const blockchainService = BlockchainService.getInstance()
    let isMounted = true

    // Initial alert for system initialization
    setAlerts([
      {
        id: "1",
        type: "info",
        message: "System initialized and ready",
        timestamp: Date.now(),
      },
    ])

    // Subscribe to Ethereum transactions
    const unsubscribeEth = blockchainService.subscribeToEthereumTransactions((tx) => {
      if (isMounted) {
        const newAlert = {
          id: `eth-${tx.hash}`,
          type: "success" as const,
          message: `New Ethereum transaction: ${tx.value} ETH`,
          timestamp: tx.timestamp,
        }
        setAlerts((prev) => [newAlert, ...prev.slice(0, 9)])
      }
    })

    // Subscribe to Solana transactions
    const unsubscribeSol = blockchainService.subscribeToSolanaTransactions((tx) => {
      if (isMounted) {
        const newAlert = {
          id: `sol-${tx.hash}`,
          type: "info" as const,
          message: `New Solana transaction detected`,
          timestamp: tx.timestamp,
        }
        setAlerts((prev) => [newAlert, ...prev.slice(0, 9)])
      }
    })

    // Cleanup subscriptions
    return () => {
      isMounted = false
      if (unsubscribeEth) unsubscribeEth()
      if (unsubscribeSol) unsubscribeSol()
    }
  }, [])

  const getAlertIcon = (type: Alert["type"]) => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-400" />
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-400" />
      case "info":
        return <Info className="h-4 w-4 text-blue-400" />
    }
  }

  const getTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000)

    if (seconds < 60) return `${seconds}s ago`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="text-yellow-400">Alert Feed</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80 overflow-auto">
          {alerts.map((alert) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mb-3 p-3 rounded-md flex items-start gap-3 ${
                alert.type === "warning"
                  ? "bg-yellow-900/20 border border-yellow-900"
                  : alert.type === "success"
                    ? "bg-green-900/20 border border-green-900"
                    : "bg-blue-900/20 border border-blue-900"
              }`}
            >
              <div className="mt-0.5">{getAlertIcon(alert.type)}</div>
              <div className="flex-1">
                <div className="text-sm">{alert.message}</div>
                <div className="text-xs text-gray-500 mt-1">{getTimeAgo(alert.timestamp)}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
