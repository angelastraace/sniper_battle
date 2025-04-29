"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Loader2, RefreshCw, Search, Zap, AlertCircle, CheckCircle } from "lucide-react"
import { addSystemLog } from "@/app/services/blockchain-monitor"

interface ScanResult {
  id: string
  address: string
  balance: number
  chain: "ETH" | "SOL" | "BSC"
  timestamp: Date
  status: "pending" | "swept" | "failed" | "no_funds"
  privateKeyAvailable: boolean
}

export function ChainSweeper() {
  const [activeTab, setActiveTab] = useState("ethereum")
  const [isScanning, setIsScanning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<ScanResult[]>([])
  const [customAddress, setCustomAddress] = useState("")
  const [blockRange, setBlockRange] = useState({ start: "", end: "" })
  const [threshold, setThreshold] = useState("0.01")

  // Simulate scanning process
  useEffect(() => {
    if (isScanning) {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setIsScanning(false)
            clearInterval(interval)
            return 0
          }
          return prev + 2
        })

        // Randomly add results during scan
        if (Math.random() > 0.8) {
          addNewResult()
        }
      }, 300)

      return () => clearInterval(interval)
    }
  }, [isScanning])

  // Add periodic updates to existing results
  useEffect(() => {
    const interval = setInterval(() => {
      if (results.length > 0 && !isScanning) {
        // Randomly update status of pending results
        setResults((prev) =>
          prev.map((result) => {
            if (result.status === "pending" && Math.random() > 0.7) {
              const newStatus = Math.random() > 0.5 ? "swept" : "failed"

              // Log the status change
              addSystemLog(
                newStatus === "swept" ? "INFO" : "WARNING",
                `${result.chain} wallet ${result.address} ${newStatus === "swept" ? "swept successfully" : "sweep failed"}`,
              )

              return {
                ...result,
                status: newStatus,
              }
            }
            return result
          }),
        )
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [results])

  // Generate a random address for the active chain
  const generateRandomAddress = () => {
    if (activeTab === "ethereum" || activeTab === "bsc") {
      return "0x" + [...Array(40)].map(() => Math.floor(Math.random() * 16).toString(16)).join("")
    } else {
      return [...Array(44)].map(() => Math.floor(Math.random() * 36).toString(36)).join("")
    }
  }

  // Add a new scan result
  const addNewResult = () => {
    const chain = activeTab === "ethereum" ? "ETH" : activeTab === "solana" ? "SOL" : "BSC"
    const hasFunds = Math.random() > 0.7
    const hasPrivateKey = Math.random() > 0.5

    const newResult: ScanResult = {
      id: Math.random().toString(36).substring(2, 15),
      address: generateRandomAddress(),
      balance: hasFunds ? Math.random() * 2 : 0,
      chain,
      timestamp: new Date(),
      status: hasFunds ? "pending" : "no_funds",
      privateKeyAvailable: hasPrivateKey,
    }

    setResults((prev) => [newResult, ...prev])

    // Log the discovery
    addSystemLog(
      hasFunds ? "INFO" : "INFO",
      `${chain} wallet ${newResult.address.substring(0, 6)}...${newResult.address.substring(newResult.address.length - 4)} ${hasFunds ? `found with ${newResult.balance.toFixed(4)} balance` : "has no funds"}`,
    )
  }

  // Start scanning
  const startScan = () => {
    setIsScanning(true)
    setProgress(0)

    // Log scan start
    addSystemLog("INFO", `Starting ${activeTab.toUpperCase()} scan with threshold ${threshold}`)
  }

  // Check a specific address
  const checkAddress = () => {
    if (!customAddress) return

    setIsScanning(true)

    // Simulate checking process
    setTimeout(() => {
      const hasFunds = Math.random() > 0.5
      const chain = activeTab === "ethereum" ? "ETH" : activeTab === "solana" ? "SOL" : "BSC"

      const newResult: ScanResult = {
        id: Math.random().toString(36).substring(2, 15),
        address: customAddress,
        balance: hasFunds ? Math.random() * 2 : 0,
        chain,
        timestamp: new Date(),
        status: hasFunds ? "pending" : "no_funds",
        privateKeyAvailable: Math.random() > 0.5,
      }

      setResults((prev) => [newResult, ...prev])
      setIsScanning(false)
      setCustomAddress("")

      // Log the check
      addSystemLog(
        "INFO",
        `Checked ${chain} address ${customAddress.substring(0, 6)}...${customAddress.substring(customAddress.length - 4)}: ${hasFunds ? `found with ${newResult.balance.toFixed(4)} balance` : "no funds"}`,
      )
    }, 2000)
  }

  // Sweep all available wallets
  const sweepAll = () => {
    // Find all pending results with funds and private keys
    const sweepableResults = results.filter((r) => r.status === "pending" && r.balance > 0 && r.privateKeyAvailable)

    if (sweepableResults.length === 0) {
      addSystemLog("WARNING", "No sweepable wallets found")
      return
    }

    // Update their status to indicate sweeping
    setResults((prev) =>
      prev.map((result) => {
        if (result.status === "pending" && result.balance > 0 && result.privateKeyAvailable) {
          return {
            ...result,
            status: "pending", // Keep as pending but will be updated in the useEffect
          }
        }
        return result
      }),
    )

    // Log the sweep operation
    addSystemLog("INFO", `Initiating sweep for ${sweepableResults.length} wallets`)
  }

  // Format address for display
  const formatAddress = (address: string) => {
    if (address.length < 10) return address
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "swept":
        return <Badge className="bg-green-100 text-green-800">Swept</Badge>
      case "failed":
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case "no_funds":
        return <Badge className="bg-gray-100 text-gray-800">No Funds</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  // Get status icon
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "swept":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case "pending":
        return <Loader2 className="h-4 w-4 text-yellow-500 animate-spin" />
      case "no_funds":
        return <AlertCircle className="h-4 w-4 text-gray-500" />
      default:
        return null
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Chain Sweeper</CardTitle>
        <CardDescription>Scan blockchains for addresses with balances above threshold</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="ethereum">Ethereum</TabsTrigger>
            <TabsTrigger value="solana">Solana</TabsTrigger>
            <TabsTrigger value="bsc">BSC</TabsTrigger>
          </TabsList>

          <TabsContent value="ethereum" className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="eth-start-block">Start Block</Label>
                <Input
                  id="eth-start-block"
                  placeholder="e.g. 15000000"
                  value={blockRange.start}
                  onChange={(e) => setBlockRange({ ...blockRange, start: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="eth-end-block">End Block</Label>
                <Input
                  id="eth-end-block"
                  placeholder="e.g. 16000000"
                  value={blockRange.end}
                  onChange={(e) => setBlockRange({ ...blockRange, end: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="eth-threshold">Balance Threshold (ETH)</Label>
              <Input
                id="eth-threshold"
                placeholder="e.g. 0.01"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
              />
            </div>
          </TabsContent>

          <TabsContent value="solana" className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sol-start-slot">Start Slot</Label>
                <Input
                  id="sol-start-slot"
                  placeholder="e.g. 150000000"
                  value={blockRange.start}
                  onChange={(e) => setBlockRange({ ...blockRange, start: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="sol-end-slot">End Slot</Label>
                <Input
                  id="sol-end-slot"
                  placeholder="e.g. 160000000"
                  value={blockRange.end}
                  onChange={(e) => setBlockRange({ ...blockRange, end: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="sol-threshold">Balance Threshold (SOL)</Label>
              <Input
                id="sol-threshold"
                placeholder="e.g. 0.1"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
              />
            </div>
          </TabsContent>

          <TabsContent value="bsc" className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="bsc-start-block">Start Block</Label>
                <Input
                  id="bsc-start-block"
                  placeholder="e.g. 25000000"
                  value={blockRange.start}
                  onChange={(e) => setBlockRange({ ...blockRange, start: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="bsc-end-block">End Block</Label>
                <Input
                  id="bsc-end-block"
                  placeholder="e.g. 26000000"
                  value={blockRange.end}
                  onChange={(e) => setBlockRange({ ...blockRange, end: e.target.value })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="bsc-threshold">Balance Threshold (BNB)</Label>
              <Input
                id="bsc-threshold"
                placeholder="e.g. 0.05"
                value={threshold}
                onChange={(e) => setThreshold(e.target.value)}
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 space-y-4">
          <div className="flex items-center space-x-2">
            <Label htmlFor="custom-address">Check Specific Address</Label>
            <div className="flex w-full max-w-sm items-center space-x-2">
              <Input
                id="custom-address"
                placeholder={`Enter ${activeTab} address`}
                value={customAddress}
                onChange={(e) => setCustomAddress(e.target.value)}
              />
              <Button type="submit" size="sm" onClick={checkAddress} disabled={isScanning || !customAddress}>
                <Search className="h-4 w-4 mr-1" />
                Check
              </Button>
            </div>
          </div>

          {isScanning && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Scanning in progress...</span>
                <span className="text-sm font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button onClick={startScan} disabled={isScanning} className="flex-1">
              {isScanning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Start Scan
                </>
              )}
            </Button>

            <Button variant="outline" onClick={() => setResults([])} className="flex-1">
              <RefreshCw className="mr-2 h-4 w-4" />
              Clear Results
            </Button>

            <Button
              variant="secondary"
              onClick={sweepAll}
              className="flex-1"
              disabled={!results.some((r) => r.status === "pending" && r.balance > 0 && r.privateKeyAvailable)}
            >
              <Zap className="mr-2 h-4 w-4" />
              Sweep Available
            </Button>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="font-medium mb-2">Scan Results</h3>
          <div className="max-h-[300px] overflow-y-auto border rounded-md">
            {results.length === 0 ? (
              <div className="p-4 text-center text-gray-500">No results yet. Start a scan to find wallets.</div>
            ) : (
              <div className="divide-y">
                {results.map((result) => (
                  <div key={result.id} className="p-3 hover:bg-gray-50 flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">{result.chain}</Badge>
                        <span className="font-mono">{formatAddress(result.address)}</span>
                        {result.privateKeyAvailable && (
                          <Badge variant="outline" className="bg-blue-100 text-blue-800">
                            Key Available
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {result.balance > 0 ? (
                          <span className="font-medium text-green-600">
                            {result.balance.toFixed(6)} {result.chain}
                          </span>
                        ) : (
                          <span>No funds</span>
                        )}
                        <span className="mx-2">•</span>
                        <span>{new Date(result.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(result.status)}
                      {getStatusBadge(result.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-gray-500">
          {results.length} results • {results.filter((r) => r.status === "swept").length} swept
        </div>
        <div className="text-sm font-medium">
          Total found: {results.reduce((sum, r) => sum + (r.balance > 0 ? 1 : 0), 0)}
        </div>
      </CardFooter>
    </Card>
  )
}
