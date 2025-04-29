"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DefiApiService, { type StablecoinStats } from "@/lib/defi-api-service"
import { formatNumber } from "@/lib/format-utils"

export default function SolanaStablecoinClient() {
  const [stablecoinStats, setStablecoinStats] = useState<StablecoinStats | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
    const defiService = DefiApiService.getInstance()
    setStablecoinStats(defiService.getSolanaStablecoins())

    // Update stats every 30 seconds
    const interval = setInterval(() => {
      setStablecoinStats(defiService.getSolanaStablecoins())
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
        <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center mr-3">
          <span className="text-xl">$</span>
        </div>
        <h1 className="text-3xl font-bold">Solana Stablecoin Network</h1>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transfer">Transfer</TabsTrigger>
          <TabsTrigger value="exchange">Exchange</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="pt-6">
                <div className="text-sm text-gray-400 mb-2">Total Market Cap</div>
                <div className="text-2xl font-bold">
                  ${stablecoinStats ? formatNumber(stablecoinStats.totalMarketCap / 1e9, 2) : "0.00"}B
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="pt-6">
                <div className="text-sm text-gray-400 mb-2">Unique Holder</div>
                <div className="text-2xl font-bold">
                  {stablecoinStats ? formatNumber(stablecoinStats.uniqueHolders, 0) : "0"}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="pt-6">
                <div className="text-sm text-gray-400 mb-2">No. of Txs Transfer 24h</div>
                <div className="text-2xl font-bold">
                  {stablecoinStats ? formatNumber(stablecoinStats.transactionCount24h, 0) : "0"}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="pt-6">
                <div className="text-sm text-gray-400 mb-2">Total Values Transfer 24h</div>
                <div className="text-2xl font-bold">
                  ${stablecoinStats ? formatNumber(stablecoinStats.totalValueTransferred24h / 1e9, 2) : "0.00"}B
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Supply Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>StableCoin Supply</CardTitle>
              </CardHeader>
              <CardContent>
                {stablecoinStats?.distribution.map((item, index) => (
                  <div key={index} className="mb-4">
                    <div className="flex justify-between mb-1">
                      <span>{item.symbol}</span>
                      <span>${formatNumber(item.value / 1e9, 2)}B</span>
                    </div>
                    <div className="w-full bg-gray-800 h-4 rounded-full overflow-hidden">
                      <div
                        className={`h-4 ${
                          index === 0
                            ? "bg-cyan-500"
                            : index === 1
                              ? "bg-green-500"
                              : index === 2
                                ? "bg-orange-500"
                                : "bg-gray-500"
                        }`}
                        style={{ width: `${item.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Distribution Supply StableCoin</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative h-64">
                  {/* Donut chart visualization */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="relative w-48 h-48">
                      {/* This would be a proper chart in a real implementation */}
                      <div className="absolute inset-0 rounded-full border-8 border-cyan-500"></div>
                      <div
                        className="absolute rounded-full border-8 border-green-500"
                        style={{
                          top: "8px",
                          left: "8px",
                          right: "8px",
                          bottom: "8px",
                          clipPath: "polygon(50% 50%, 100% 50%, 100% 100%, 50% 100%)",
                        }}
                      ></div>
                      <div
                        className="absolute rounded-full border-8 border-orange-500"
                        style={{
                          top: "16px",
                          left: "16px",
                          right: "16px",
                          bottom: "16px",
                          clipPath: "polygon(50% 50%, 100% 0%, 100% 10%, 50% 10%)",
                        }}
                      ></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <div className="text-xl font-bold">
                            ${stablecoinStats ? formatNumber(stablecoinStats.totalMarketCap / 1e9, 2) : "0.00"}B
                          </div>
                          <div className="text-sm text-gray-400">TOTAL</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Legend */}
                  <div className="absolute right-0 top-0 space-y-2">
                    {stablecoinStats?.distribution.map((item, index) => (
                      <div key={index} className="flex items-center">
                        <div
                          className={`w-3 h-3 rounded-full mr-2 ${
                            index === 0
                              ? "bg-cyan-500"
                              : index === 1
                                ? "bg-green-500"
                                : index === 2
                                  ? "bg-orange-500"
                                  : "bg-gray-500"
                          }`}
                        ></div>
                        <span className="text-sm">{item.symbol}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transfer">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 text-center">
            <p className="text-gray-400">Transfer data would be displayed here</p>
          </div>
        </TabsContent>

        <TabsContent value="exchange">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 text-center">
            <p className="text-gray-400">Exchange data would be displayed here</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
