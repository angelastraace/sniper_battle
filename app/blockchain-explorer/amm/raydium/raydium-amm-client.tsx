"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DefiApiService, { type DexStats, type AmmPool } from "@/lib/defi-api-service"
import { formatNumber, formatLargeNumber } from "@/lib/format-utils"
import { ExternalLink } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

export default function RaydiumAmmClient() {
  const [dexStats, setDexStats] = useState<DexStats | null>(null)
  const [pools, setPools] = useState<AmmPool[]>([])
  const [activeTab, setActiveTab] = useState("market-overview")
  const [isClient, setIsClient] = useState(false)
  const [timeRange, setTimeRange] = useState("7D")

  useEffect(() => {
    setIsClient(true)
    const defiService = DefiApiService.getInstance()

    // Get Raydium stats
    const raydium = defiService.getDex("solana", "Raydium")
    setDexStats(raydium)

    // Get Raydium pools
    setPools(defiService.getSolanaPools().filter((pool) => pool.platform === "Raydium"))

    // Update stats every 30 seconds
    const interval = setInterval(() => {
      const raydium = defiService.getDex("solana", "Raydium")
      setDexStats(raydium)
      setPools(defiService.getSolanaPools().filter((pool) => pool.platform === "Raydium"))
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  if (!isClient) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-6">
      <div className="flex items-center mb-6">
        <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center mr-3">
          <span className="text-xl">R</span>
        </div>
        <div>
          <h1 className="text-3xl font-bold">Raydium</h1>
          <p className="text-sm text-gray-400">An on-chain order book AMM powering the evolution of DeFi</p>
        </div>
      </div>

      <Tabs defaultValue="market-overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="market-overview">Market Overview</TabsTrigger>
          <TabsTrigger value="pools">Pools</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
        </TabsList>

        <TabsContent value="market-overview">
          {/* Volume Stats */}
          <Card className="bg-gray-900 border-gray-800 mb-8">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center justify-between">
                <span>Total Volume</span>
                <div className="flex space-x-2">
                  <button
                    className={`px-2 py-1 rounded-md ${timeRange === "7D" ? "bg-purple-600" : "bg-gray-800"}`}
                    onClick={() => setTimeRange("7D")}
                  >
                    7D
                  </button>
                  <button
                    className={`px-2 py-1 rounded-md ${timeRange === "30D" ? "bg-purple-600" : "bg-gray-800"}`}
                    onClick={() => setTimeRange("30D")}
                  >
                    30D
                  </button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                  <div className="text-2xl font-bold">
                    ${dexStats ? formatLargeNumber(dexStats.totalVolume24h) : "$0.00"}
                  </div>
                  <div
                    className={`text-sm ${dexStats?.change24h && dexStats.change24h >= 0 ? "text-green-500" : "text-red-500"}`}
                  >
                    {dexStats?.change24h ? formatNumber(dexStats.change24h, 2) : "0.00"}%
                  </div>
                </div>

                {/* Volume Chart Placeholder */}
                <div className="w-full md:w-3/4 h-64 bg-gray-800 rounded-lg mt-4 md:mt-0 flex items-center justify-center">
                  <div className="text-gray-500">Volume chart would render here</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="pt-6">
                <div className="text-sm text-gray-400 mb-2">Total Value Locked (24H)</div>
                <div className="text-2xl font-bold">
                  ${dexStats ? formatLargeNumber(dexStats.totalValueLocked) : "$0.00"}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="pt-6">
                <div className="text-sm text-gray-400 mb-2">Active Users (24H)</div>
                <div className="text-2xl font-bold">{dexStats ? formatNumber(dexStats.totalUsers, 0) : "0"}</div>
                <div
                  className={`text-sm ${dexStats?.change24h && dexStats.change24h >= 0 ? "text-green-500" : "text-red-500"}`}
                >
                  -28.33%
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="pt-6">
                <div className="text-sm text-gray-400 mb-2">Total Transactions (24H)</div>
                <div className="text-2xl font-bold">{dexStats ? formatNumber(dexStats.totalTransactions, 0) : "0"}</div>
                <div className="text-sm text-red-500">-35.05%</div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="pt-6">
                <div className="text-sm text-gray-400 mb-2">Raydium Token Price</div>
                <div className="text-2xl font-bold">$0.35</div>
                <div className="text-sm text-red-500">-7.4%</div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="pools">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle>Liquidity Pools</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left py-3 px-4">Pool</th>
                      <th className="text-right py-3 px-4">TVL</th>
                      <th className="text-right py-3 px-4">Volume (24h)</th>
                      <th className="text-right py-3 px-4">Fee</th>
                      <th className="text-right py-3 px-4">APR</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pools.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-4 text-gray-500">
                          Loading pools...
                        </td>
                      </tr>
                    ) : (
                      pools.map((pool) => (
                        <tr key={pool.id} className="border-b border-gray-800 hover:bg-gray-800">
                          <td className="py-3 px-4">
                            <div className="flex items-center">
                              <div className="flex -space-x-2 mr-2">
                                <div className="w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-xs">
                                  {pool.token0.symbol.charAt(0)}
                                </div>
                                <div className="w-6 h-6 rounded-full bg-green-600 flex items-center justify-center text-xs">
                                  {pool.token1.symbol.charAt(0)}
                                </div>
                              </div>
                              <span>{pool.name}</span>
                            </div>
                          </td>
                          <td className="text-right py-3 px-4">${formatLargeNumber(pool.tvl)}</td>
                          <td className="text-right py-3 px-4">${formatLargeNumber(pool.volume24h)}</td>
                          <td className="text-right py-3 px-4">{pool.fee}%</td>
                          <td className="text-right py-3 px-4 text-green-500">{formatNumber(pool.apr, 2)}%</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activities">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from({ length: 10 }).map((_, index) => (
                  <div key={index} className="p-3 bg-gray-800 rounded-md">
                    <div className="flex justify-between">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-purple-900 flex items-center justify-center mr-3">
                          <span className="text-xs">TX</span>
                        </div>
                        <div>
                          <div className="flex items-center">
                            <a href="#" className="text-purple-400 hover:underline text-sm">
                              {`${Math.random().toString(36).substring(2, 10)}...`}
                            </a>
                            <ExternalLink size={12} className="ml-1" />
                          </div>
                          <div className="text-xs text-gray-400">
                            {formatDistanceToNow(Date.now() - Math.random() * 3600000, { addSuffix: true })}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm">SetComputeUnitLimit</div>
                        <div className="text-xs text-gray-400">1+</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
