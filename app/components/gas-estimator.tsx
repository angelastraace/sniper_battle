"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Zap, RefreshCw, AlertCircle } from "lucide-react"

interface GasPrice {
  slow: {
    price: string
    time: string
  }
  average: {
    price: string
    time: string
  }
  fast: {
    price: string
    time: string
  }
  instant: {
    price: string
    time: string
  }
}

export default function GasEstimator() {
  const [gasData, setGasData] = useState<GasPrice | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [network, setNetwork] = useState<"ethereum" | "bsc" | "solana">("ethereum")

  const fetchGasData = async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/gas/${network}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch gas data: ${response.status}`)
      }

      const data = await response.json()
      setGasData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch gas data")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGasData()

    // Refresh gas data every 30 seconds
    const interval = setInterval(fetchGasData, 30000)

    return () => clearInterval(interval)
  }, [network])

  const handleNetworkChange = (newNetwork: "ethereum" | "bsc" | "solana") => {
    setNetwork(newNetwork)
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center">
          <Zap className="mr-2 h-5 w-5" />
          Gas Estimator
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between mb-4">
          <Button
            variant={network === "ethereum" ? "default" : "outline"}
            size="sm"
            onClick={() => handleNetworkChange("ethereum")}
          >
            Ethereum
          </Button>
          <Button
            variant={network === "bsc" ? "default" : "outline"}
            size="sm"
            onClick={() => handleNetworkChange("bsc")}
          >
            BSC
          </Button>
          <Button
            variant={network === "solana" ? "default" : "outline"}
            size="sm"
            onClick={() => handleNetworkChange("solana")}
          >
            Solana
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-4">
            {gasData && (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="text-muted-foreground">Speed</div>
                  <div className="text-muted-foreground">Price</div>
                  <div className="text-muted-foreground">Time</div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs items-center">
                  <div className="flex items-center">
                    <Badge variant="outline" className="bg-red-900/20 text-red-400 border-red-800">
                      Instant
                    </Badge>
                  </div>
                  <div>{gasData.instant.price}</div>
                  <div>{gasData.instant.time}</div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs items-center">
                  <div className="flex items-center">
                    <Badge variant="outline" className="bg-orange-900/20 text-orange-400 border-orange-800">
                      Fast
                    </Badge>
                  </div>
                  <div>{gasData.fast.price}</div>
                  <div>{gasData.fast.time}</div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs items-center">
                  <div className="flex items-center">
                    <Badge variant="outline" className="bg-yellow-900/20 text-yellow-400 border-yellow-800">
                      Average
                    </Badge>
                  </div>
                  <div>{gasData.average.price}</div>
                  <div>{gasData.average.time}</div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs items-center">
                  <div className="flex items-center">
                    <Badge variant="outline" className="bg-green-900/20 text-green-400 border-green-800">
                      Slow
                    </Badge>
                  </div>
                  <div>{gasData.slow.price}</div>
                  <div>{gasData.slow.time}</div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm" onClick={fetchGasData} className="w-full">
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh Gas Prices
        </Button>
      </CardFooter>
    </Card>
  )
}
