"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Wallet, ArrowRight, RefreshCw, CheckCircle, AlertCircle, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import TradingStrategy from "@/lib/trading-strategy"
import { config } from "@/lib/config"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface ProfitTransfer {
  id: string
  timestamp: number
  amount: string
  token: string
  status: "pending" | "completed" | "failed"
  txHash?: string
  chain: "ethereum" | "solana" | "bsc"
}

export default function ProfitManagementPage() {
  const [destinationWallet, setDestinationWallet] = useState({
    ethereum: config.destinationWallets.ethereum || "",
    solana: config.destinationWallets.solana || "",
    bsc: config.destinationWallets.bsc || "",
  })
  const [selectedChain, setSelectedChain] = useState<"ethereum" | "solana" | "bsc">("ethereum")
  const [isLoading, setIsLoading] = useState(false)
  const [balance, setBalance] = useState({ ethereum: "0", solana: "0", bsc: "0" })
  const [transfers, setTransfers] = useState<ProfitTransfer[]>([])
  const [autoTransfer, setAutoTransfer] = useState(false)
  const [profitThreshold, setProfitThreshold] = useState("0.01")
  const [tradingStatus, setTradingStatus] = useState(false)
  const [positions, setPositions] = useState<any[]>([])
  const [profitHistory, setProfitHistory] = useState<any[]>([])
  const { toast } = useToast()

  useEffect(() => {
    // Load saved destination wallets
    const savedEthWallet = localStorage.getItem("destinationWalletEth")
    const savedSolWallet = localStorage.getItem("destinationWalletSol")
    const savedBscWallet = localStorage.getItem("destinationWalletBsc")

    if (savedEthWallet) setDestinationWallet((prev) => ({ ...prev, ethereum: savedEthWallet }))
    if (savedSolWallet) setDestinationWallet((prev) => ({ ...prev, solana: savedSolWallet }))
    if (savedBscWallet) setDestinationWallet((prev) => ({ ...prev, bsc: savedBscWallet }))

    // Load saved transfers
    const savedTransfers = localStorage.getItem("profitTransfers")
    if (savedTransfers) {
      try {
        setTransfers(JSON.parse(savedTransfers))
      } catch (e) {
        console.error("Failed to parse saved transfers:", e)
      }
    }

    // Load auto-transfer settings
    const savedAutoTransfer = localStorage.getItem("autoTransfer")
    if (savedAutoTransfer) setAutoTransfer(savedAutoTransfer === "true")

    const savedThreshold = localStorage.getItem("profitThreshold")
    if (savedThreshold) setProfitThreshold(savedThreshold)

    // Get trading strategy status
    const tradingStrategy = TradingStrategy.getInstance()
    const status = tradingStrategy.getStatus()
    setTradingStatus(status.isRunning)
    setPositions(status.positions)

    // Generate sample profit history data
    generateProfitHistoryData()

    // Fetch balances
    fetchBalances()

    // Set up interval to refresh data
    const interval = setInterval(() => {
      fetchBalances()
      const status = tradingStrategy.getStatus()
      setTradingStatus(status.isRunning)
      setPositions(status.positions)
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  const generateProfitHistoryData = () => {
    // Generate sample profit history data for the last 30 days
    const data = []
    const now = new Date()
    let ethTotal = 0
    let solTotal = 0
    let bscTotal = 0

    for (let i = 30; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)

      // Generate random daily profits
      const ethProfit = Math.random() * 0.01
      const solProfit = Math.random() * 0.05
      const bscProfit = Math.random() * 0.02

      ethTotal += ethProfit
      solTotal += solProfit
      bscTotal += bscProfit

      data.push({
        date: date.toISOString().split("T")[0],
        ethereum: ethProfit.toFixed(4),
        solana: solProfit.toFixed(4),
        bsc: bscProfit.toFixed(4),
        ethTotal: ethTotal.toFixed(4),
        solTotal: solTotal.toFixed(4),
        bscTotal: bscTotal.toFixed(4),
      })
    }

    setProfitHistory(data)
  }

  const fetchBalances = async () => {
    try {
      setIsLoading(true)

      // Get profits from trading strategy
      const tradingStrategy = TradingStrategy.getInstance()
      const profits = tradingStrategy.getProfits()

      // Convert to string format
      setBalance({
        ethereum: profits.ethereum.toFixed(6),
        solana: profits.solana.toFixed(6),
        bsc: profits.bsc.toFixed(6),
      })
    } catch (error) {
      console.error("Error fetching balances:", error)
      toast({
        title: "Error",
        description: "Failed to fetch wallet balances",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const saveDestinationWallet = () => {
    localStorage.setItem("destinationWalletEth", destinationWallet.ethereum)
    localStorage.setItem("destinationWalletSol", destinationWallet.solana)
    localStorage.setItem("destinationWalletBsc", destinationWallet.bsc)

    // Also update in config
    config.destinationWallets.ethereum = destinationWallet.ethereum
    config.destinationWallets.solana = destinationWallet.solana
    config.destinationWallets.bsc = destinationWallet.bsc

    toast({
      title: "Success",
      description: "Destination wallets saved successfully",
    })
  }

  const transferProfit = async () => {
    try {
      setIsLoading(true)

      const tradingStrategy = TradingStrategy.getInstance()
      const success = await tradingStrategy.manualTransferProfits(selectedChain)

      if (success) {
        // Create a new transfer record
        const newTransfer: ProfitTransfer = {
          id: `transfer-${Date.now()}`,
          timestamp: Date.now(),
          amount: balance[selectedChain],
          token: selectedChain === "ethereum" ? "ETH" : selectedChain === "solana" ? "SOL" : "BNB",
          status: "completed",
          txHash: `0x${Math.random().toString(16).substring(2, 10)}...`,
          chain: selectedChain,
        }

        // Add to transfers list
        setTransfers((prev) => {
          const updated = [newTransfer, ...prev]
          localStorage.setItem("profitTransfers", JSON.stringify(updated))
          return updated
        })

        toast({
          title: "Transfer Complete",
          description: `Successfully transferred ${balance[selectedChain]} ${
            selectedChain === "ethereum" ? "ETH" : selectedChain === "solana" ? "SOL" : "BNB"
          } to your wallet`,
        })

        // Reset balance for the selected chain
        setBalance((prev) => ({
          ...prev,
          [selectedChain]: "0",
        }))
      } else {
        toast({
          title: "Transfer Failed",
          description: "Failed to transfer profits. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error transferring profit:", error)
      toast({
        title: "Error",
        description: "Failed to transfer profit",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const toggleAutoTransfer = () => {
    const newValue = !autoTransfer
    setAutoTransfer(newValue)
    localStorage.setItem("autoTransfer", String(newValue))

    toast({
      title: newValue ? "Auto-Transfer Enabled" : "Auto-Transfer Disabled",
      description: newValue
        ? `Profits will automatically transfer when they exceed ${profitThreshold} tokens`
        : "Automatic profit transfers have been disabled",
    })
  }

  const updateProfitThreshold = (value: string) => {
    setProfitThreshold(value)
    localStorage.setItem("profitThreshold", value)
  }

  const toggleTradingStrategy = () => {
    const tradingStrategy = TradingStrategy.getInstance()

    if (tradingStatus) {
      tradingStrategy.stopTrading()
      setTradingStatus(false)
      toast({
        title: "Trading Stopped",
        description: "Automated trading strategy has been stopped",
      })
    } else {
      tradingStrategy.startTrading()
      setTradingStatus(true)
      toast({
        title: "Trading Started",
        description: "Automated trading strategy is now running",
      })
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  const getExplorerUrl = (chain: string, txHash?: string) => {
    if (!txHash) return "#"

    if (chain === "ethereum") {
      return `https://etherscan.io/tx/${txHash}`
    } else if (chain === "solana") {
      return `https://solscan.io/tx/${txHash}`
    } else if (chain === "bsc") {
      return `https://bscscan.com/tx/${txHash}`
    }

    return "#"
  }

  const getChainIcon = (chain: string) => {
    switch (chain) {
      case "ethereum":
        return "🔷"
      case "solana":
        return "🟣"
      case "bsc":
        return "🟡"
      default:
        return "🔷"
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gray-900 border-gray-800 col-span-1 md:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-cyan-400">Profit Dashboard</CardTitle>
            <Button
              onClick={toggleTradingStrategy}
              className={tradingStatus ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
            >
              {tradingStatus ? "Stop Trading" : "Start Trading"}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Ethereum</span>
                  <span className="text-xl font-bold">{balance.ethereum} ETH</span>
                </div>
                <div className="mt-2">
                  <Button
                    onClick={() => {
                      setSelectedChain("ethereum")
                      transferProfit()
                    }}
                    disabled={isLoading || Number.parseFloat(balance.ethereum) <= 0}
                    className="w-full bg-green-600 hover:bg-green-700"
                    size="sm"
                  >
                    <Wallet className="h-4 w-4 mr-2" />
                    Transfer to Wallet
                  </Button>
                </div>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Solana</span>
                  <span className="text-xl font-bold">{balance.solana} SOL</span>
                </div>
                <div className="mt-2">
                  <Button
                    onClick={() => {
                      setSelectedChain("solana")
                      transferProfit()
                    }}
                    disabled={isLoading || Number.parseFloat(balance.solana) <= 0}
                    className="w-full bg-green-600 hover:bg-green-700"
                    size="sm"
                  >
                    <Wallet className="h-4 w-4 mr-2" />
                    Transfer to Wallet
                  </Button>
                </div>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">BSC</span>
                  <span className="text-xl font-bold">{balance.bsc} BNB</span>
                </div>
                <div className="mt-2">
                  <Button
                    onClick={() => {
                      setSelectedChain("bsc")
                      transferProfit()
                    }}
                    disabled={isLoading || Number.parseFloat(balance.bsc) <= 0}
                    className="w-full bg-green-600 hover:bg-green-700"
                    size="sm"
                  >
                    <Wallet className="h-4 w-4 mr-2" />
                    Transfer to Wallet
                  </Button>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-4">Profit History</h3>
              <div className="h-[300px]">
                <ChartContainer
                  config={{
                    ethereum: {
                      label: "ETH Profit",
                      color: "hsl(var(--chart-1))",
                    },
                    solana: {
                      label: "SOL Profit",
                      color: "hsl(var(--chart-2))",
                    },
                    bsc: {
                      label: "BNB Profit",
                      color: "hsl(var(--chart-3))",
                    },
                  }}
                  className="h-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={profitHistory} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Legend />
                      <Line type="monotone" dataKey="ethereum" stroke="var(--color-ethereum)" name="ETH Profit" />
                      <Line type="monotone" dataKey="solana" stroke="var(--color-solana)" name="SOL Profit" />
                      <Line type="monotone" dataKey="bsc" stroke="var(--color-bsc)" name="BNB Profit" />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="wallets">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="wallets">Wallet Settings</TabsTrigger>
          <TabsTrigger value="transfers">Transfer History</TabsTrigger>
          <TabsTrigger value="positions">Trading Positions</TabsTrigger>
        </TabsList>

        <TabsContent value="wallets">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-cyan-400">Destination Wallets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="eth-wallet">Ethereum Destination Wallet</Label>
                  <Input
                    id="eth-wallet"
                    value={destinationWallet.ethereum}
                    onChange={(e) => setDestinationWallet((prev) => ({ ...prev, ethereum: e.target.value }))}
                    placeholder="0x..."
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
                <div>
                  <Label htmlFor="sol-wallet">Solana Destination Wallet</Label>
                  <Input
                    id="sol-wallet"
                    value={destinationWallet.solana}
                    onChange={(e) => setDestinationWallet((prev) => ({ ...prev, solana: e.target.value }))}
                    placeholder="..."
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
                <div>
                  <Label htmlFor="bsc-wallet">BSC Destination Wallet</Label>
                  <Input
                    id="bsc-wallet"
                    value={destinationWallet.bsc}
                    onChange={(e) => setDestinationWallet((prev) => ({ ...prev, bsc: e.target.value }))}
                    placeholder="0x..."
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={saveDestinationWallet} className="bg-cyan-600 hover:bg-cyan-700">
                  Save Destination Wallets
                </Button>
              </div>

              <div className="border-t border-gray-800 pt-4 mt-4">
                <h3 className="text-lg font-medium mb-4">Auto-Transfer Settings</h3>

                <div className="flex flex-col md:flex-row gap-4 items-end">
                  <div className="w-full md:w-1/3">
                    <Label htmlFor="profit-threshold">Profit Threshold</Label>
                    <Input
                      id="profit-threshold"
                      type="number"
                      value={profitThreshold}
                      onChange={(e) => updateProfitThreshold(e.target.value)}
                      placeholder="0.01"
                      className="bg-gray-800 border-gray-700"
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      Automatically transfer profits when they exceed this amount
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch id="auto-transfer" checked={autoTransfer} onCheckedChange={toggleAutoTransfer} />
                    <Label htmlFor="auto-transfer">
                      {autoTransfer ? "Auto-Transfer Enabled" : "Enable Auto-Transfer"}
                    </Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transfers">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-green-400">Profit Transfer History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                {transfers.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No profit transfers yet</div>
                ) : (
                  transfers.map((transfer) => (
                    <div key={transfer.id} className="bg-gray-800 p-4 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center">
                            {transfer.status === "completed" ? (
                              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            ) : transfer.status === "failed" ? (
                              <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                            ) : (
                              <RefreshCw className="h-4 w-4 text-yellow-500 mr-2 animate-spin" />
                            )}
                            <span className="font-medium">
                              {transfer.amount} {transfer.token}
                            </span>
                          </div>
                          <div className="text-sm text-gray-400 mt-1">{formatDate(transfer.timestamp)}</div>
                        </div>

                        <div className="text-right">
                          <div
                            className={`text-sm ${
                              transfer.status === "completed"
                                ? "text-green-500"
                                : transfer.status === "failed"
                                  ? "text-red-500"
                                  : "text-yellow-500"
                            }`}
                          >
                            {transfer.status.charAt(0).toUpperCase() + transfer.status.slice(1)}
                          </div>

                          {transfer.txHash && (
                            <a
                              href={getExplorerUrl(transfer.chain, transfer.txHash)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-blue-400 hover:underline flex items-center justify-end mt-1"
                            >
                              View Transaction
                              <ArrowRight className="h-3 w-3 ml-1" />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="positions">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-blue-400">Trading Positions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-[400px] overflow-y-auto">
                {positions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">No active positions</div>
                ) : (
                  positions.map((position) => (
                    <div key={position.id} className="bg-gray-800 p-4 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center">
                            <span className="mr-1">{getChainIcon(position.chain)}</span>
                            <span className="font-medium">{position.tokenSymbol}</span>
                            <Badge
                              className={`ml-2 ${
                                position.status === "open"
                                  ? "bg-blue-600"
                                  : position.profit && position.profit > 0
                                    ? "bg-green-600"
                                    : "bg-red-600"
                              }`}
                            >
                              {position.status === "open" ? "Open" : "Closed"}
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-400 mt-1">{formatDate(position.timestamp)}</div>
                        </div>

                        <div className="text-right">
                          <div className="text-sm">
                            {position.amount.toFixed(4)} @ ${position.entryPrice.toFixed(2)}
                          </div>
                          {position.status === "closed" && (
                            <div
                              className={`text-xs ${position.profit && position.profit > 0 ? "text-green-500" : "text-red-500"}`}
                            >
                              Profit: {position.profit ? position.profit.toFixed(6) : "-"}
                            </div>
                          )}
                        </div>
                      </div>

                      {position.status === "open" && (
                        <div className="mt-2 flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 border-gray-700 hover:bg-gray-700"
                            onClick={() => {
                              const tradingStrategy = TradingStrategy.getInstance()
                              tradingStrategy.manualSell(position.id)
                            }}
                          >
                            Close Position
                          </Button>
                          <Button size="sm" variant="outline" className="border-gray-700 hover:bg-gray-700">
                            <Clock className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
