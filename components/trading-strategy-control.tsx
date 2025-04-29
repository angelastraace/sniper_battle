"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Play, Pause, Settings, TrendingUp, RefreshCw } from "lucide-react"
import TradingStrategy from "@/lib/trading-strategy"
import { useToast } from "@/hooks/use-toast"

interface Position {
  id: string
  chain: "ethereum" | "solana" | "bsc"
  tokenAddress: string
  tokenSymbol: string
  entryPrice: number
  amount: number
  timestamp: number
  status: "open" | "closed"
  exitPrice?: number
  profit?: number
  txHash?: string
}

interface Opportunity {
  chain: "ethereum" | "solana" | "bsc"
  tokenAddress: string
  tokenSymbol: string
  confidence: number
  expectedReturn: number
  timeframe: "short" | "medium" | "long"
  reason: string
}

interface StrategyParams {
  maxSlippage: number
  gasMultiplier: number
  minProfitThreshold: number
  maxPositionSize: number
  stopLossPercentage: number
  takeProfitPercentage: number
  tradeInterval: number
}

export default function TradingStrategyControl() {
  const [isRunning, setIsRunning] = useState(false)
  const [positions, setPositions] = useState<Position[]>([])
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [profits, setProfits] = useState({ ethereum: 0, solana: 0, bsc: 0 })
  const [params, setParams] = useState<StrategyParams>({
    maxSlippage: 1,
    gasMultiplier: 1.1,
    minProfitThreshold: 0.5,
    maxPositionSize: 0.1,
    stopLossPercentage: 2,
    takeProfitPercentage: 1,
    tradeInterval: 60000,
  })
  const [isUpdatingParams, setIsUpdatingParams] = useState(false)
  const [manualBuyChain, setManualBuyChain] = useState<"ethereum" | "solana" | "bsc">("ethereum")
  const [manualBuyToken, setManualBuyToken] = useState("")
  const [manualBuyAmount, setManualBuyAmount] = useState("")
  const [isExecutingManualBuy, setIsExecutingManualBuy] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const tradingStrategy = TradingStrategy.getInstance()

    // Get initial state
    const status = tradingStrategy.getStatus()
    setIsRunning(status.isRunning)
    setPositions(status.positions)
    setOpportunities(status.opportunities)
    setProfits(status.profits)
    setParams(status.params)

    // Set up interval to refresh data
    const interval = setInterval(() => {
      const status = tradingStrategy.getStatus()
      setPositions(status.positions)
      setOpportunities(status.opportunities)
    }, 10000)

    // Subscribe to profit updates
    const unsubscribe = tradingStrategy.subscribeToProfitUpdates((newProfits) => {
      setProfits(newProfits)
    })

    return () => {
      clearInterval(interval)
      unsubscribe()
    }
  }, [])

  const handleStartStop = () => {
    const tradingStrategy = TradingStrategy.getInstance()

    if (isRunning) {
      tradingStrategy.stopTrading()
      setIsRunning(false)
      toast({
        title: "Trading Stopped",
        description: "Automated trading strategy has been stopped",
      })
    } else {
      tradingStrategy.startTrading()
      setIsRunning(true)
      toast({
        title: "Trading Started",
        description: "Automated trading strategy is now running",
      })
    }
  }

  const handleUpdateParams = () => {
    try {
      setIsUpdatingParams(true)

      const tradingStrategy = TradingStrategy.getInstance()
      const updatedParams = tradingStrategy.updateStrategyParams(params)

      setParams(updatedParams)
      toast({
        title: "Settings Updated",
        description: "Trading strategy parameters have been updated",
      })
    } catch (error) {
      console.error("Error updating params:", error)
      toast({
        title: "Update Failed",
        description: "There was an error updating the parameters",
        variant: "destructive",
      })
    } finally {
      setIsUpdatingParams(false)
    }
  }

  const handleManualBuy = async () => {
    try {
      setIsExecutingManualBuy(true)

      if (!manualBuyToken || !manualBuyAmount) {
        toast({
          title: "Invalid Input",
          description: "Please enter a token symbol and amount",
          variant: "destructive",
        })
        return
      }

      const amount = Number.parseFloat(manualBuyAmount)
      if (isNaN(amount) || amount <= 0) {
        toast({
          title: "Invalid Amount",
          description: "Please enter a valid amount",
          variant: "destructive",
        })
        return
      }

      const tradingStrategy = TradingStrategy.getInstance()
      const success = await tradingStrategy.manualBuy(manualBuyChain, manualBuyToken, amount)

      if (success) {
        toast({
          title: "Buy Order Executed",
          description: `Successfully bought ${manualBuyAmount} ${manualBuyToken} on ${manualBuyChain}`,
        })

        // Reset form
        setManualBuyToken("")
        setManualBuyAmount("")

        // Refresh positions
        setPositions(tradingStrategy.getPositions())
      } else {
        toast({
          title: "Buy Order Failed",
          description: "There was an error executing your buy order",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error executing manual buy:", error)
      toast({
        title: "Buy Order Failed",
        description: "There was an error executing your buy order",
        variant: "destructive",
      })
    } finally {
      setIsExecutingManualBuy(false)
    }
  }

  const handleManualSell = async (positionId: string) => {
    try {
      const tradingStrategy = TradingStrategy.getInstance()
      const success = await tradingStrategy.manualSell(positionId)

      if (success) {
        toast({
          title: "Sell Order Executed",
          description: "Position has been closed successfully",
        })

        // Refresh positions
        setPositions(tradingStrategy.getPositions())
      } else {
        toast({
          title: "Sell Order Failed",
          description: "There was an error closing the position",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error executing manual sell:", error)
      toast({
        title: "Sell Order Failed",
        description: "There was an error closing the position",
        variant: "destructive",
      })
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString()
  }

  const formatProfit = (value: number | undefined) => {
    if (value === undefined) return "-"
    return value.toFixed(6)
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
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-cyan-400">Trading Strategy</CardTitle>
        <Button
          onClick={handleStartStop}
          className={isRunning ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
        >
          {isRunning ? (
            <>
              <Pause className="h-4 w-4 mr-2" /> Stop Trading
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" /> Start Trading
            </>
          )}
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="positions">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="positions">Positions</TabsTrigger>
            <TabsTrigger value="opportunities">Opportunities</TabsTrigger>
            <TabsTrigger value="manual">Manual Trading</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="positions" className="space-y-4">
            {positions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No active positions</div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {positions.map((position) => (
                  <div key={position.id} className="bg-gray-800 p-3 rounded-lg">
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
                            Profit: {formatProfit(position.profit)}
                          </div>
                        )}
                      </div>
                    </div>

                    {position.status === "open" && (
                      <div className="mt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full border-gray-700 hover:bg-gray-700"
                          onClick={() => handleManualSell(position.id)}
                        >
                          Close Position
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="opportunities" className="space-y-4">
            {opportunities.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No trading opportunities detected</div>
            ) : (
              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {opportunities.map((opportunity, index) => (
                  <div key={index} className="bg-gray-800 p-3 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center">
                          <span className="mr-1">{getChainIcon(opportunity.chain)}</span>
                          <span className="font-medium">{opportunity.tokenSymbol}</span>
                          <Badge className="ml-2 bg-blue-600">{opportunity.timeframe}</Badge>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">{opportunity.reason}</div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm">Confidence: {opportunity.confidence}%</div>
                        <div className="text-xs text-green-500">
                          Expected: +{opportunity.expectedReturn.toFixed(2)}%
                        </div>
                      </div>
                    </div>

                    <div className="mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full border-gray-700 hover:bg-gray-700"
                        onClick={() => {
                          setManualBuyChain(opportunity.chain)
                          setManualBuyToken(opportunity.tokenSymbol)
                          setManualBuyAmount("0.01")
                        }}
                      >
                        Trade Now
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="manual" className="space-y-4">
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-sm font-medium mb-3">Manual Trading</h3>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="chain-select">Chain</Label>
                  <Select
                    value={manualBuyChain}
                    onValueChange={(value) => setManualBuyChain(value as "ethereum" | "solana" | "bsc")}
                  >
                    <SelectTrigger className="bg-gray-700 border-gray-600">
                      <SelectValue placeholder="Select Chain" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ethereum">Ethereum</SelectItem>
                      <SelectItem value="solana">Solana</SelectItem>
                      <SelectItem value="bsc">BSC</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="token-symbol">Token Symbol</Label>
                  <Input
                    id="token-symbol"
                    value={manualBuyToken}
                    onChange={(e) => setManualBuyToken(e.target.value)}
                    placeholder="e.g. UNI, AAVE, LINK"
                    className="bg-gray-700 border-gray-600"
                  />
                </div>

                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={manualBuyAmount}
                    onChange={(e) => setManualBuyAmount(e.target.value)}
                    placeholder="0.01"
                    className="bg-gray-700 border-gray-600"
                  />
                </div>

                <Button
                  onClick={handleManualBuy}
                  disabled={isExecutingManualBuy || !manualBuyToken || !manualBuyAmount}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {isExecutingManualBuy ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Executing Trade
                    </>
                  ) : (
                    <>
                      <TrendingUp className="h-4 w-4 mr-2" /> Execute Buy
                    </>
                  )}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <div className="bg-gray-800 p-4 rounded-lg">
              <h3 className="text-sm font-medium mb-3">Strategy Parameters</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="max-slippage">Max Slippage (%)</Label>
                  <Input
                    id="max-slippage"
                    type="number"
                    value={params.maxSlippage}
                    onChange={(e) => setParams({ ...params, maxSlippage: Number.parseFloat(e.target.value) })}
                    className="bg-gray-700 border-gray-600"
                  />
                </div>

                <div>
                  <Label htmlFor="gas-multiplier">Gas Price Multiplier</Label>
                  <Input
                    id="gas-multiplier"
                    type="number"
                    value={params.gasMultiplier}
                    onChange={(e) => setParams({ ...params, gasMultiplier: Number.parseFloat(e.target.value) })}
                    className="bg-gray-700 border-gray-600"
                  />
                </div>

                <div>
                  <Label htmlFor="min-profit">Min Profit Threshold (%)</Label>
                  <Input
                    id="min-profit"
                    type="number"
                    value={params.minProfitThreshold}
                    onChange={(e) => setParams({ ...params, minProfitThreshold: Number.parseFloat(e.target.value) })}
                    className="bg-gray-700 border-gray-600"
                  />
                </div>

                <div>
                  <Label htmlFor="max-position">Max Position Size</Label>
                  <Input
                    id="max-position"
                    type="number"
                    value={params.maxPositionSize}
                    onChange={(e) => setParams({ ...params, maxPositionSize: Number.parseFloat(e.target.value) })}
                    className="bg-gray-700 border-gray-600"
                  />
                </div>

                <div>
                  <Label htmlFor="stop-loss">Stop Loss (%)</Label>
                  <Input
                    id="stop-loss"
                    type="number"
                    value={params.stopLossPercentage}
                    onChange={(e) => setParams({ ...params, stopLossPercentage: Number.parseFloat(e.target.value) })}
                    className="bg-gray-700 border-gray-600"
                  />
                </div>

                <div>
                  <Label htmlFor="take-profit">Take Profit (%)</Label>
                  <Input
                    id="take-profit"
                    type="number"
                    value={params.takeProfitPercentage}
                    onChange={(e) => setParams({ ...params, takeProfitPercentage: Number.parseFloat(e.target.value) })}
                    className="bg-gray-700 border-gray-600"
                  />
                </div>
              </div>

              <Button
                onClick={handleUpdateParams}
                disabled={isUpdatingParams}
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
              >
                {isUpdatingParams ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Updating
                  </>
                ) : (
                  <>
                    <Settings className="h-4 w-4 mr-2" /> Update Settings
                  </>
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
