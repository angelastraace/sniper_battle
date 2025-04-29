"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ExternalLink, WifiOffIcon, AlertTriangleIcon } from "lucide-react"
import type { Block, Transaction, ChainStats, TokenInfo } from "@/lib/blockchain-api-service"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface EthereumExplorerProps {
  blocks: Block[]
  transactions: Transaction[]
  stats: ChainStats | null
  tokenInfo: TokenInfo | null
  isConnected: boolean
}

export default function EthereumExplorer({
  blocks,
  transactions,
  stats,
  tokenInfo,
  isConnected,
}: EthereumExplorerProps) {
  const [activeTab, setActiveTab] = useState("overview")

  const formatAddress = (address: string) => {
    if (!address) return "Unknown"
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffSeconds < 60) {
      return `${diffSeconds} sec ago`
    } else if (diffSeconds < 3600) {
      return `${Math.floor(diffSeconds / 60)} min ago`
    } else {
      return `${Math.floor(diffSeconds / 3600)} hr ago`
    }
  }

  const formatNumber = (num: number | undefined) => {
    if (num === undefined) return "0"
    return new Intl.NumberFormat("en-US").format(num)
  }

  const formatPrice = (price: number | undefined) => {
    if (price === undefined) return "$0.00"
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(price)
  }

  const formatPercent = (percent: number | undefined) => {
    if (percent === undefined) return "0.00%"
    return `${percent > 0 ? "+" : ""}${percent.toFixed(2)}%`
  }

  return (
    <div className="space-y-6">
      {!isConnected && (
        <Alert className="bg-red-900/20 border-red-800 mb-4">
          <AlertTriangleIcon className="h-4 w-4 text-red-500 mr-2" />
          <AlertTitle>Connection Error</AlertTitle>
          <AlertDescription>Unable to connect to Ethereum network. Showing cached or fallback data.</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl flex items-center">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center mr-2">
                <span className="text-sm">Ξ</span>
              </div>
              Ethereum
              <span className="text-sm ml-2 text-gray-400">ETH</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{formatPrice(tokenInfo?.price)}</div>
            <div
              className={`text-sm ${
                (tokenInfo?.change24h || 0) >= 0 ? "text-green-500" : "text-red-500"
              } font-medium mb-4`}
            >
              {formatPercent(tokenInfo?.change24h)}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-400">Market Cap</div>
                <div className="font-medium">{formatPrice(tokenInfo?.marketCap)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">24h Volume</div>
                <div className="font-medium">{formatPrice(tokenInfo?.volume24h)}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Latest Block</div>
                <div className="font-medium">{stats?.latestBlock || "Unknown"}</div>
              </div>
              <div>
                <div className="text-sm text-gray-400">Gas Price</div>
                <div className="font-medium">{stats?.gasPrice || "Unknown"} Gwei</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle>Price Chart</CardTitle>
          </CardHeader>
          <CardContent className="h-[200px] flex items-center justify-center">
            <div className="text-gray-500">Price chart would render here</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-gray-900 border-gray-800">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="blocks">Blocks</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Market Info</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Market Cap</span>
                    <span>{formatPrice(stats?.marketCap)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">24h Trading Vol</span>
                    <span>{formatPrice(stats?.volume24h)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">24h High</span>
                    <span>{formatPrice(stats?.high24h)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">24h Low</span>
                    <span>{formatPrice(stats?.low24h)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Circulating Supply</span>
                    <span>{formatNumber(stats?.circulatingSupply)} ETH</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle>Network Info</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Latest Block</span>
                    <span>{stats?.latestBlock || "Unknown"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Gas Price</span>
                    <span>{stats?.gasPrice || "Unknown"} Gwei</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Transactions Per Second</span>
                    <span>{stats?.transactionsPerSecond || "Unknown"} TPS</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Algorithm</span>
                    <span>Proof of Stake</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="blocks">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle>Latest Blocks</CardTitle>
            </CardHeader>
            <CardContent>
              {blocks.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <WifiOffIcon className="h-12 w-12 text-gray-500 mb-3" />
                  <p className="text-gray-500">No blocks available</p>
                  {!isConnected && (
                    <p className="text-gray-600 text-sm mt-2">Connection to Ethereum network is unavailable</p>
                  )}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Block</TableHead>
                      <TableHead>Age</TableHead>
                      <TableHead>Txns</TableHead>
                      <TableHead className="hidden md:table-cell">Miner</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {blocks.map((block) => (
                      <TableRow key={block.hash}>
                        <TableCell>
                          <a
                            href={`https://etherscan.io/block/${block.number}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-blue-500 hover:text-blue-400"
                          >
                            {block.number}
                            <ExternalLink size={12} className="ml-1" />
                          </a>
                        </TableCell>
                        <TableCell>{formatTime(block.timestamp)}</TableCell>
                        <TableCell>{block.transactions}</TableCell>
                        <TableCell className="hidden md:table-cell font-mono text-xs">
                          {formatAddress(block.miner || "")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle>Latest Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8">
                  <WifiOffIcon className="h-12 w-12 text-gray-500 mb-3" />
                  <p className="text-gray-500">No transactions available</p>
                  {!isConnected && (
                    <p className="text-gray-600 text-sm mt-2">Connection to Ethereum network is unavailable</p>
                  )}
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tx Hash</TableHead>
                      <TableHead>From</TableHead>
                      <TableHead>To</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.map((tx) => (
                      <TableRow key={tx.hash}>
                        <TableCell className="font-mono text-xs">
                          <a
                            href={`https://etherscan.io/tx/${tx.hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-blue-500 hover:text-blue-400"
                          >
                            {formatAddress(tx.hash)}
                            <ExternalLink size={12} className="ml-1" />
                          </a>
                        </TableCell>
                        <TableCell className="font-mono text-xs">{formatAddress(tx.from)}</TableCell>
                        <TableCell className="font-mono text-xs">{formatAddress(tx.to)}</TableCell>
                        <TableCell>{tx.value} ETH</TableCell>
                        <TableCell>
                          <Badge
                            className={
                              tx.status === "success"
                                ? "bg-green-500/20 text-green-500 hover:bg-green-500/30"
                                : tx.status === "pending"
                                  ? "bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30"
                                  : "bg-red-500/20 text-red-500 hover:bg-red-500/30"
                            }
                          >
                            {tx.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
