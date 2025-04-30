"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export function RpcConnectionTester() {
  const [ethStatus, setEthStatus] = useState<"loading" | "connected" | "error">("loading")
  const [ethBlock, setEthBlock] = useState<string | null>(null)
  const [solStatus, setSolStatus] = useState<"loading" | "connected" | "error">("loading")
  const [solSlot, setSolSlot] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const testConnections = async () => {
    setIsRefreshing(true)
    setEthStatus("loading")
    setSolStatus("loading")

    // Test Ethereum connection
    try {
      const ethResponse = await fetch("/api/rpc/ethereum", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_blockNumber",
          params: [],
          id: 1,
        }),
      })

      const ethData = await ethResponse.json()

      if (ethData.error) {
        console.error("Ethereum RPC error:", ethData.error)
        setEthStatus("error")
      } else {
        const blockNumber = Number.parseInt(ethData.result, 16)
        setEthBlock(blockNumber.toLocaleString())
        setEthStatus("connected")
        console.log("✅ Ethereum connected, block:", blockNumber)
      }
    } catch (error) {
      console.error("Ethereum connection error:", error)
      setEthStatus("error")
    }

    // Test Solana connection
    try {
      const solResponse = await fetch("/api/rpc/solana", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "getSlot",
          params: [],
          id: 1,
        }),
      })

      const solData = await solResponse.json()

      if (solData.error) {
        console.error("Solana RPC error:", solData.error)
        setSolStatus("error")
      } else {
        setSolSlot(solData.result.toLocaleString())
        setSolStatus("connected")
        console.log("✅ Solana connected, slot:", solData.result)
      }
    } catch (error) {
      console.error("Solana connection error:", error)
      setSolStatus("error")
    }

    setIsRefreshing(false)
  }

  useEffect(() => {
    testConnections()
  }, [])

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between">
            Ethereum RPC Connection
            {ethStatus === "loading" ? (
              <Badge variant="outline" className="flex items-center">
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Connecting...
              </Badge>
            ) : ethStatus === "connected" ? (
              <Badge variant="success">Connected</Badge>
            ) : (
              <Badge variant="destructive">Error</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {ethStatus === "connected" && ethBlock && (
            <p className="text-sm">
              Latest Block: <span className="font-mono font-bold">{ethBlock}</span>
            </p>
          )}
          {ethStatus === "error" && (
            <p className="text-sm text-red-500">Failed to connect to Ethereum RPC. Check console for details.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center justify-between">
            Solana RPC Connection
            {solStatus === "loading" ? (
              <Badge variant="outline" className="flex items-center">
                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                Connecting...
              </Badge>
            ) : solStatus === "connected" ? (
              <Badge variant="success">Connected</Badge>
            ) : (
              <Badge variant="destructive">Error</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {solStatus === "connected" && solSlot && (
            <p className="text-sm">
              Current Slot: <span className="font-mono font-bold">{solSlot}</span>
            </p>
          )}
          {solStatus === "error" && (
            <p className="text-sm text-red-500">Failed to connect to Solana RPC. Check console for details.</p>
          )}
        </CardContent>
      </Card>

      <Button onClick={testConnections} disabled={isRefreshing} className="w-full">
        {isRefreshing && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        Refresh Connections
      </Button>
    </div>
  )
}
