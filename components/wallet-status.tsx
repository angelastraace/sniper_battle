"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff, Copy, ExternalLink, RefreshCw, AlertTriangle } from "lucide-react"
import { useBlockchainConnection, type NetworkType } from "@/lib/blockchain-connection-manager"
import { useToast } from "@/hooks/use-toast"

interface WalletStatusProps {
  network: NetworkType
  address: string
  privateKey: string
  balance?: string
  explorerUrl: string
}

export default function WalletStatus({ network, address, privateKey, balance, explorerUrl }: WalletStatusProps) {
  const [showPrivateKey, setShowPrivateKey] = useState(false)
  const { status, resetConnection } = useBlockchainConnection()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { toast } = useToast()

  const networkColors = {
    ethereum: "blue",
    solana: "green",
    bsc: "yellow",
  }

  const networkNames = {
    ethereum: "Ethereum",
    solana: "Solana",
    bsc: "BSC",
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await resetConnection(network)
    setIsRefreshing(false)
  }

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied!",
      description: message,
    })
  }

  const color = networkColors[network]

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className={`text-${color}-400`}>{networkNames[network]} Wallet</CardTitle>
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-1 text-xs ${status[network] === "connected" ? "text-green-400" : "text-red-400"}`}
          >
            <div
              className={`w-2 h-2 rounded-full ${status[network] === "connected" ? "bg-green-400" : "bg-red-400"}`}
            ></div>
            {status[network] === "connected" ? "Connected" : "Disconnected"}
          </div>
          <Button variant="ghost" size="sm" onClick={handleRefresh} disabled={isRefreshing} className="h-8 w-8 p-0">
            <RefreshCw size={16} className={isRefreshing ? "animate-spin" : ""} />
            <span className="sr-only">Refresh</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="text-sm text-gray-400 mb-1">Address</div>
            <div className="flex items-center gap-2">
              <div className="bg-gray-800 p-3 rounded-md text-sm font-mono flex-1 truncate">
                {address || "No wallet configured"}
              </div>
              <button
                onClick={() => copyToClipboard(address, "Address copied to clipboard")}
                className="p-2 bg-gray-800 rounded-md hover:bg-gray-700"
                disabled={!address}
              >
                <Copy className="h-4 w-4" />
              </button>
              {address && (
                <a
                  href={`${explorerUrl}${address}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-gray-800 rounded-md hover:bg-gray-700"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-400 mb-1">Private Key</div>
            <div className="flex items-center gap-2">
              <div className="bg-gray-800 p-3 rounded-md text-sm font-mono flex-1 truncate">
                {showPrivateKey
                  ? privateKey || "No private key configured"
                  : privateKey
                    ? "••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••"
                    : "No private key configured"}
              </div>
              <button
                onClick={() => setShowPrivateKey(!showPrivateKey)}
                className="p-2 bg-gray-800 rounded-md hover:bg-gray-700"
                disabled={!privateKey}
              >
                {showPrivateKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-400 mb-1">Balance</div>
            <div className="bg-gray-800 p-3 rounded-md">
              {status[network] !== "connected" ? (
                <div className="flex items-center text-red-400 py-1">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  <span>Network disconnected</span>
                </div>
              ) : balance ? (
                <div className={`text-xl font-bold text-${color}-400`}>
                  {balance} {network === "ethereum" ? "ETH" : network === "solana" ? "SOL" : "BNB"}
                </div>
              ) : (
                <div className="text-gray-500 text-sm py-1">No wallet configured</div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
