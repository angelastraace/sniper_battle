"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BlockchainService } from "@/lib/blockchain-service"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, BarChart, Bar } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Wallet, ArrowUpRight, ArrowDownRight, Activity, TrendingUp } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface Transaction {
  hash: string
  from: string
  to: string
  value: string
  timestamp: number
  url: string
}

interface TokenData {
  symbol: string
  name: string
  price: number
  change24h: number
  volume: number
  marketCap: number
}

export default function AnalyticsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [ethData, setEthData] = useState<TokenData | null>(null)
  const [solData, setSolData] = useState<TokenData | null>(null)
  const [bscData, setBscData] = useState<TokenData | null>(null)
  const [loading, setLoading] = useState(true)
  const [priceHistory, setPriceHistory] = useState<any[]>([])
  const [volumeData, setVolumeData] = useState<any[]>([])
  const [transactionCount, setTransactionCount] = useState(0)
  const [totalValue, setTotalValue] = useState(0)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const blockchainService = BlockchainService.getInstance()

      try {
        // Fetch some recent transactions from known DEX routers
        const ethRouters = [
          "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D", // Uniswap V2 Router
          "0xE592427A0AEce92De3Edee1F18E0157C05861564", // Uniswap V3 Router
        ]

        const bscRouters = [
          "0x10ED43C718714eb63d5aA57B78B54704E256024E", // PancakeSwap Router
        ]

        let allTxs: Transaction[] = []

        // Get Ethereum transactions
        for (const router of ethRouters) {
          try {
            const txs = await blockchainService.getEthereumTransactions(router, 5)
            allTxs = [...allTxs, ...txs]
          } catch (err) {
            console.error("Error fetching Ethereum transactions:", err)
          }
        }

        // Get BSC transactions
        for (const router of bscRouters) {
          try {
            const txs = await blockchainService.getBscTransactions(router, 5)
            allTxs = [...allTxs, ...txs]
          } catch (err) {
            console.error("Error fetching BSC transactions:", err)
          }
        }

        // Sort by timestamp (newest first)
        allTxs.sort((a, b) => b.timestamp - a.timestamp)

        // Take only the most recent transactions
        setTransactions(allTxs.slice(0, 10))
        setTransactionCount(allTxs.length)

        // Calculate total value (very rough estimate)
        const totalEth = allTxs
          .filter((tx) => tx.url.includes("etherscan"))
          .reduce((sum, tx) => sum + Number.parseFloat(tx.value || "0"), 0)

        const totalBnb = allTxs
          .filter((tx) => tx.url.includes("bscscan"))
          .reduce((sum, tx) => sum + Number.parseFloat(tx.value || "0"), 0)

        // Rough USD conversion
        const ethPrice = 1800 // Approximate ETH price in USD
        const bnbPrice = 230 // Approximate BNB price in USD

        setTotalValue(totalEth * ethPrice + totalBnb * bnbPrice)

        // Generate token data
        setEthData({
          symbol: "ETH",
          name: "Ethereum",
          price: 1800 + Math.random() * 50,
          change24h: -1.2 + Math.random() * 2,
          volume: 9800000000 + Math.random() * 500000000,
          marketCap: 216000000000 + Math.random() * 1000000000,
        })

        setSolData({
          symbol: "SOL",
          name: "Solana",
          price: 105 + Math.random() * 10,
          change24h: 2.5 + Math.random() * 1.5,
          volume: 2500000000 + Math.random() * 200000000,
          marketCap: 42500000000 + Math.random() * 500000000,
        })

        setBscData({
          symbol: "BNB",
          name: "Binance Coin",
          price: 230 + Math.random() * 15,
          change24h: 0.8 + Math.random() * 1,
          volume: 1250000000 + Math.random() * 100000000,
          marketCap: 38500000000 + Math.random() * 300000000,
        })

        // Generate price history data (last 7 days)
        const priceHistoryData = []
        const now = new Date()

        for (let i = 6; i >= 0; i--) {
          const date = new Date(now)
          date.setDate(date.getDate() - i)

          priceHistoryData.push({
            date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            ETH: 1800 - i * 10 + Math.random() * 50,
            SOL: 105 - i * 2 + Math.random() * 10,
            BNB: 230 - i * 5 + Math.random() * 15,
          })
        }

        setPriceHistory(priceHistoryData)

        // Generate volume data
        const volumeHistoryData = []

        for (let i = 6; i >= 0; i--) {
          const date = new Date(now)
          date.setDate(date.getDate() - i)

          volumeHistoryData.push({
            date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            ETH: 9800 - i * 200 + Math.random() * 500,
            SOL: 2500 - i * 100 + Math.random() * 200,
            BNB: 1250 - i * 50 + Math.random() * 100,
          })
        }

        setVolumeData(volumeHistoryData)
      } catch (error) {
        console.error("Error fetching analytics data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // Refresh data every 60 seconds
    const interval = setInterval(fetchData, 60000)

    return () => clearInterval(interval)
  }, [])

  const formatAddress = (address: string) => {
    if (!address) return "Unknown"
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("en-US").format(num)
  }

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(num)
  }

  const formatLargeNumber = (num: number) => {
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`
    return `$${num.toFixed(2)}`
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-6 space-y-6 pb-20"
    >
      <h1 className="text-3xl font-bold text-white mb-6">Analytics Dashboard</h1>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-lg text-gray-400">Loading analytics data...</span>
        </div>
      ) : (
        <>
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-400">Total Transactions</p>
                    <p className="text-2xl font-bold mt-1">{formatNumber(transactionCount)}</p>
                  </div>
                  <div className="p-2 bg-blue-500/20 rounded-full">
                    <Activity className="h-6 w-6 text-blue-500" />
                  </div>
                </div>
                <div className="mt-2 flex items-center text-sm">
                  <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-500">+12.5%</span>
                  <span className="text-gray-400 ml-2">from last period</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-400">Total Value</p>
                    <p className="text-2xl font-bold mt-1">{formatCurrency(totalValue)}</p>
                  </div>
                  <div className="p-2 bg-green-500/20 rounded-full">
                    <Wallet className="h-6 w-6 text-green-500" />
                  </div>
                </div>
                <div className="mt-2 flex items-center text-sm">
                  <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-green-500">+8.2%</span>
                  <span className="text-gray-400 ml-2">from last period</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-400">ETH Price</p>
                    <p className="text-2xl font-bold mt-1">${ethData?.price.toFixed(2)}</p>
                  </div>
                  <div className="p-2 bg-blue-500/20 rounded-full">
                    <TrendingUp className="h-6 w-6 text-blue-500" />
                  </div>
                </div>
                <div className="mt-2 flex items-center text-sm">
                  {ethData && ethData.change24h >= 0 ? (
                    <>
                      <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-green-500">+{ethData.change24h.toFixed(2)}%</span>
                    </>
                  ) : (
                    <>
                      <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                      <span className="text-red-500">{ethData?.change24h.toFixed(2)}%</span>
                    </>
                  )}
                  <span className="text-gray-400 ml-2">24h change</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="pt-6">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-400">SOL Price</p>
                    <p className="text-2xl font-bold mt-1">${solData?.price.toFixed(2)}</p>
                  </div>
                  <div className="p-2 bg-green-500/20 rounded-full">
                    <TrendingUp className="h-6 w-6 text-green-500" />
                  </div>
                </div>
                <div className="mt-2 flex items-center text-sm">
                  {solData && solData.change24h >= 0 ? (
                    <>
                      <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-green-500">+{solData.change24h.toFixed(2)}%</span>
                    </>
                  ) : (
                    <>
                      <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                      <span className="text-red-500">{solData?.change24h.toFixed(2)}%</span>
                    </>
                  )}
                  <span className="text-gray-400 ml-2">24h change</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Price Chart */}
          <Card className="bg-gray-900 border-gray-800 mb-8">
            <CardHeader>
              <CardTitle className="text-cyan-400">Price Comparison (7 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ChartContainer
                  config={{
                    ETH: {
                      label: "Ethereum",
                      color: "hsl(var(--chart-1))",
                    },
                    SOL: {
                      label: "Solana",
                      color: "hsl(var(--chart-2))",
                    },
                    BNB: {
                      label: "Binance Coin",
                      color: "hsl(var(--chart-3))",
                    },
                  }}
                  className="h-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={priceHistory} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" />
                      <YAxis stroke="rgba(255,255,255,0.5)" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Line type="monotone" dataKey="ETH" stroke="var(--color-ETH)" strokeWidth={2} dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="SOL" stroke="var(--color-SOL)" strokeWidth={2} dot={{ r: 4 }} />
                      <Line type="monotone" dataKey="BNB" stroke="var(--color-BNB)" strokeWidth={2} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>

          {/* Volume Chart */}
          <Card className="bg-gray-900 border-gray-800 mb-8">
            <CardHeader>
              <CardTitle className="text-purple-400">Trading Volume (7 Days, in millions USD)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ChartContainer
                  config={{
                    ETH: {
                      label: "Ethereum",
                      color: "hsl(var(--chart-1))",
                    },
                    SOL: {
                      label: "Solana",
                      color: "hsl(var(--chart-2))",
                    },
                    BNB: {
                      label: "Binance Coin",
                      color: "hsl(var(--chart-3))",
                    },
                  }}
                  className="h-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={volumeData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="date" stroke="rgba(255,255,255,0.5)" />
                      <YAxis stroke="rgba(255,255,255,0.5)" />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Bar dataKey="ETH" fill="var(--color-ETH)" />
                      <Bar dataKey="SOL" fill="var(--color-SOL)" />
                      <Bar dataKey="BNB" fill="var(--color-BNB)" />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </CardContent>
          </Card>

          {/* Token Market Data */}
          <Card className="bg-gray-900 border-gray-800 mb-8">
            <CardHeader>
              <CardTitle className="text-blue-400">Token Market Data</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-800">
                      <th className="text-left py-3 px-4">Token</th>
                      <th className="text-right py-3 px-4">Price</th>
                      <th className="text-right py-3 px-4">24h Change</th>
                      <th className="text-right py-3 px-4">Volume (24h)</th>
                      <th className="text-right py-3 px-4">Market Cap</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ethData && (
                      <tr className="border-b border-gray-800 hover:bg-gray-800">
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center mr-3 text-xs">
                              ETH
                            </div>
                            <div>
                              <div>{ethData.name}</div>
                              <div className="text-xs text-gray-400">{ethData.symbol}</div>
                            </div>
                          </div>
                        </td>
                        <td className="text-right py-3 px-4">${ethData.price.toFixed(2)}</td>
                        <td
                          className={`text-right py-3 px-4 ${ethData.change24h >= 0 ? "text-green-500" : "text-red-500"}`}
                        >
                          {ethData.change24h >= 0 ? "+" : ""}
                          {ethData.change24h.toFixed(2)}%
                        </td>
                        <td className="text-right py-3 px-4">{formatLargeNumber(ethData.volume)}</td>
                        <td className="text-right py-3 px-4">{formatLargeNumber(ethData.marketCap)}</td>
                      </tr>
                    )}

                    {solData && (
                      <tr className="border-b border-gray-800 hover:bg-gray-800">
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center mr-3 text-xs">
                              SOL
                            </div>
                            <div>
                              <div>{solData.name}</div>
                              <div className="text-xs text-gray-400">{solData.symbol}</div>
                            </div>
                          </div>
                        </td>
                        <td className="text-right py-3 px-4">${solData.price.toFixed(2)}</td>
                        <td
                          className={`text-right py-3 px-4 ${solData.change24h >= 0 ? "text-green-500" : "text-red-500"}`}
                        >
                          {solData.change24h >= 0 ? "+" : ""}
                          {solData.change24h.toFixed(2)}%
                        </td>
                        <td className="text-right py-3 px-4">{formatLargeNumber(solData.volume)}</td>
                        <td className="text-right py-3 px-4">{formatLargeNumber(solData.marketCap)}</td>
                      </tr>
                    )}

                    {bscData && (
                      <tr className="border-b border-gray-800 hover:bg-gray-800">
                        <td className="py-3 px-4">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-yellow-600 flex items-center justify-center mr-3 text-xs">
                              BNB
                            </div>
                            <div>
                              <div>{bscData.name}</div>
                              <div className="text-xs text-gray-400">{bscData.symbol}</div>
                            </div>
                          </div>
                        </td>
                        <td className="text-right py-3 px-4">${bscData.price.toFixed(2)}</td>
                        <td
                          className={`text-right py-3 px-4 ${bscData.change24h >= 0 ? "text-green-500" : "text-red-500"}`}
                        >
                          {bscData.change24h >= 0 ? "+" : ""}
                          {bscData.change24h.toFixed(2)}%
                        </td>
                        <td className="text-right py-3 px-4">{formatLargeNumber(bscData.volume)}</td>
                        <td className="text-right py-3 px-4">{formatLargeNumber(bscData.marketCap)}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-green-400">Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">No transactions found</div>
                ) : (
                  transactions.map((tx, index) => (
                    <div key={index} className="p-3 bg-gray-800 rounded-md">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">
                          {tx.url.includes("etherscan") ? "Ethereum" : tx.url.includes("bscscan") ? "BSC" : "Solana"}
                        </span>
                        <span className="text-sm text-blue-400">
                          {tx.value} {tx.url.includes("etherscan") ? "ETH" : tx.url.includes("bscscan") ? "BNB" : "SOL"}
                        </span>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-gray-400">
                          From: {formatAddress(tx.from)} → To: {formatAddress(tx.to)}
                        </span>
                        <div className="flex items-center">
                          <span className="text-xs text-gray-400 mr-1">
                            {formatDistanceToNow(tx.timestamp, { addSuffix: true })}
                          </span>
                          <a
                            href={tx.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-blue-400 hover:underline ml-2"
                          >
                            View
                          </a>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </motion.div>
  )
}
