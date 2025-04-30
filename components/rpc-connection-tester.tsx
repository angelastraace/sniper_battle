"use client"

import { useEffect, useState } from "react"
import { ethers } from "ethers"
import { Connection } from "@solana/web3.js"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, RefreshCw } from "lucide-react"

export function RpcConnectionTester() {
  const [ethStatus, setEthStatus] = useState<"loading" | "success" | "error">("loading")
  const [solStatus, setSolStatus] = useState<"loading" | "success" | "error">("loading")
  const [ethBlockNumber, setEthBlockNumber] = useState<number | null>(null)
  const [solSlot, setSolSlot] = useState<number | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const testConnections = async () => {
    setIsRefreshing(true)
    setEthStatus("loading")
    setSolStatus("loading")

    // Test Ethereum connection
    try {
      console.log("Testing Ethereum RPC proxy...")
      const ethProvider = new ethers.JsonRpcProvider("/api/rpc/ethereum")
      const blockNumber = await ethProvider.getBlockNumber()
      console.log("✅ Ethereum Block Number:", blockNumber)
      setEthBlockNumber(blockNumber)
      setEthStatus("success")
    } catch (err) {
      console.error("❌ Ethereum RPC Proxy Error:", err)
      setEthStatus("error")
    }

    // Test Solana connection
    try {
      console.log("Testing Solana RPC proxy...")
      const connectionConfig = {
        commitment: "confirmed",
        confirmTransactionInitialTimeout: 60000,
        disableRetryOnRateLimit: false,
        maxSupportedTransactionVersion: 0,
      }
      const solConnection = new Connection("/api/rpc/solana", connectionConfig)
      const slot = await solConnection.getSlot()
      console.log("✅ Solana Current Slot:", slot)
      setSolSlot(slot)
      setSolStatus("success")
    } catch (err) {
      console.error("❌ Solana RPC Proxy Error:", err)
      setSolStatus("error")
    }

    setIsRefreshing(false)
  }

  useEffect(() => {
    testConnections()
  }, [])

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>RPC Proxy Verification</CardTitle>
        <CardDescription>Verify that your blockchain RPC proxies are working correctly</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="font-medium">Ethereum RPC:</span>
          {ethStatus === "loading" ? (
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
              Checking...
            </Badge>
          ) : ethStatus === "success" ? (
            <Badge variant="outline" className="bg-green-100 text-green-800">
              <CheckCircle className="h-3.5 w-3.5 mr-1" />
              Connected
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-red-100 text-red-800">
              <AlertCircle className="h-3.5 w-3.5 mr-1" />
              Failed
            </Badge>
          )}
        </div>

        {ethBlockNumber !== null && (
          <div className="text-sm text-gray-500">
            Latest Block: <span className="font-mono">{ethBlockNumber.toLocaleString()}</span>
          </div>
        )}

        <div className="flex items-center justify-between mt-4">
          <span className="font-medium">Solana RPC:</span>
          {solStatus === "loading" ? (
            <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
              Checking...
            </Badge>
          ) : solStatus === "success" ? (
            <Badge variant="outline" className="bg-green-100 text-green-800">
              <CheckCircle className="h-3.5 w-3.5 mr-1" />
              Connected
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-red-100 text-red-800">
              <AlertCircle className="h-3.5 w-3.5 mr-1" />
              Failed
            </Badge>
          )}
        </div>

        {solSlot !== null && (
          <div className="text-sm text-gray-500">
            Current Slot: <span className="font-mono">{solSlot.toLocaleString()}</span>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={testConnections} disabled={isRefreshing} className="w-full">
          {isRefreshing && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
          {isRefreshing ? "Testing Connections..." : "Refresh Connections"}
        </Button>
      </CardFooter>
    </Card>
  )
}
