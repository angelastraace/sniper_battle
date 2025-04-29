"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2 } from "lucide-react"
import Image from "next/image"

type ChainStatus = {
  solana: boolean
  ethereum: boolean
  bsc: boolean
}

export default function ChainStatusPanel() {
  const [chainStatus, setChainStatus] = useState<ChainStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/battle-manager/chain-status")
      if (!res.ok) {
        throw new Error("Failed to fetch chain status")
      }
      const data = await res.json()
      setChainStatus(data)
      setError(null)
    } catch (err) {
      setError("Failed to load chain status. Please try again.")
      console.error("Error fetching chain status:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 5000) // auto refresh every 5 seconds
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading chain status...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500">{error}</p>
        <button onClick={fetchStatus} className="mt-2 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90">
          Retry
        </button>
      </div>
    )
  }

  if (!chainStatus) {
    return null
  }

  const chainIcons = {
    solana: "/solana-logo.png",
    ethereum: "/ethereum-logo.png",
    bsc: "/binance-logo.png",
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Chain Battle Status</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Object.entries(chainStatus).map(([chain, active]) => (
          <Card key={chain} className={`border-l-4 ${active ? "border-l-green-500" : "border-l-red-500"}`}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 relative mr-3">
                  <Image
                    src={
                      chainIcons[chain as keyof typeof chainIcons] ||
                      "/placeholder.svg?height=40&width=40&query=blockchain"
                    }
                    alt={`${chain} logo`}
                    width={40}
                    height={40}
                  />
                </div>
                <div>
                  <h3 className="text-lg font-bold capitalize">{chain}</h3>
                  <Badge variant={active ? "success" : "destructive"} className="mt-1">
                    {active ? "🟢 ACTIVE" : "🔴 PAUSED"}
                  </Badge>
                </div>
              </div>
              <div className={`w-3 h-3 rounded-full ${active ? "bg-green-500" : "bg-red-500"} animate-pulse`}></div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
