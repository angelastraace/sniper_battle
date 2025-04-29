"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Wallet, ArrowRight, RefreshCw, CheckCircle, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { BlockchainService } from "@/lib/blockchain-service"
import { config } from "@/lib/config"

interface ProfitTransfer {
  id: string
  timestamp: number
  amount: string
  token: string
  status: "pending" | "completed" | "failed"
  txHash?: string
  chain: "ethereum" | "solana" | "bsc"
}

export default function ProfitTransferSystem() {
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

    // Fetch balances
    fetchBalances()

    // Set up interval to check for profits and auto-transfer if enabled
    const interval = setInterval(() => {
      if (autoTransfer) {
        checkAndTransferProfits()
      }
    }, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [autoTransfer])

  const fetchBalances = async () => {
    try {
      setIsLoading(true)
      const blockchainService = BlockchainService.getInstance()

      // Fetch balances for trading wallets (these would be your sniper wallets)
      // In a real implementation, you would have a list of trading wallets to check
      const ethBalance = await blockchainService.getEthereumBalance("0x123...") // Replace with actual trading wallet
      const solBalance = await blockchainService.getSolanaBalance("abc123...") // Replace with actual trading wallet
      const bscBalance = await blockchainService.getBscBalance("0x456...") // Replace with actual trading wallet

      setBalance({
        ethereum: ethBalance,
        solana: solBalance,
        bsc: bscBalance,
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

      // In a real implementation, this would send a transaction to transfer profits
      // For now, we'll simulate a transfer

      // Create a new transfer record
      const newTransfer: ProfitTransfer = {
        id: `transfer-${Date.now()}`,
        timestamp: Date.now(),
        amount: balance[selectedChain],
        token: selectedChain === "ethereum" ? "ETH" : selectedChain === "solana" ? "SOL" : "BNB",
        status: "pending",
        chain: selectedChain,
      }

      // Add to transfers list
      setTransfers((prev) => {
        const updated = [newTransfer, ...prev]
        localStorage.setItem("profitTransfers", JSON.stringify(updated))
        return updated
      })

      // Simulate transaction processing
      setTimeout(() => {
        // Update transfer status to completed
        setTransfers((prev) => {
          const updated = prev.map((t) =>
            t.id === newTransfer.id
              ? {
                  ...t,
                  status: "completed",
                  txHash: `0x${Math.random().toString(16).substring(2, 10)}...`,
                }
              : t,
          )
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
      }, 3000)
    } catch (error) {
      console.error("Error transferring profit:", error)
      toast({
        title: "Error",
        description: "Failed to transfer profit",
        variant: "destructive",
      })

      // Update transfer status to failed
      setTransfers((prev) => {
        const updated = prev.map((t) => (t.id === `transfer-${Date.now()}` ? { ...t, status: "failed" } : t))
        localStorage.setItem("profitTransfers", JSON.stringify(updated))
        return updated
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

  const checkAndTransferProfits = async () => {
    // This would check if profits exceed threshold and transfer automatically
    // For now, we'll just simulate this process

    Object.entries(balance).forEach(([chain, amount]) => {
      const numAmount = Number.parseFloat(amount)
      const threshold = Number.parseFloat(profitThreshold)

      if (numAmount >= threshold) {
        // Trigger transfer for this chain
        console.log(`Auto-transferring ${amount} from ${chain} chain`)

        // In a real implementation, this would call the transfer function
        // For now, we'll just simulate it
        const newTransfer: ProfitTransfer = {
          id: `auto-transfer-${Date.now()}-${chain}`,
          timestamp: Date.now(),
          amount: amount,
          token: chain === "ethereum" ? "ETH" : chain === "solana" ? "SOL" : "BNB",
          status: "completed",
          txHash: `0x${Math.random().toString(16).substring(2, 10)}...`,
          chain: chain as "ethereum" | "solana" | "bsc",
        }

        setTransfers((prev) => {
          const updated = [newTransfer, ...prev]
          localStorage.setItem("profitTransfers", JSON.stringify(updated))
          return updated
        })

        // Reset balance for this chain
        setBalance((prev) => ({
          ...prev,
          [chain]: "0",
        }))

        toast({
          title: "Auto-Transfer Complete",
          description: `Successfully transferred ${amount} ${
            chain === "ethereum" ? "ETH" : chain === "solana" ? "SOL" : "BNB"
          } to your wallet`,
        })
      }
    })
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

  return (
    <div className="space-y-6">
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-cyan-400">Profit Transfer System</CardTitle>
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
            <h3 className="text-lg font-medium mb-4">Available Profits</h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Ethereum</span>
                  <span className="text-xl font-bold">{balance.ethereum} ETH</span>
                </div>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Solana</span>
                  <span className="text-xl font-bold">{balance.solana} SOL</span>
                </div>
              </div>
              <div className="bg-gray-800 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">BSC</span>
                  <span className="text-xl font-bold">{balance.bsc} BNB</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="w-full md:w-1/3">
                <Label htmlFor="chain-select">Select Chain</Label>
                <Select
                  value={selectedChain}
                  onValueChange={(value) => setSelectedChain(value as "ethereum" | "solana" | "bsc")}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700">
                    <SelectValue placeholder="Select Chain" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ethereum">Ethereum</SelectItem>
                    <SelectItem value="solana">Solana</SelectItem>
                    <SelectItem value="bsc">BSC</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex gap-2 w-full md:w-auto">
                <Button onClick={fetchBalances} variant="outline" disabled={isLoading} className="border-gray-700">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh
                </Button>

                <Button
                  onClick={transferProfit}
                  disabled={isLoading || Number.parseFloat(balance[selectedChain]) <= 0}
                  className="bg-green-600 hover:bg-green-700 flex-1 md:flex-none"
                >
                  <Wallet className="h-4 w-4 mr-2" />
                  Transfer Profit
                </Button>
              </div>
            </div>
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

              <Button
                onClick={toggleAutoTransfer}
                variant={autoTransfer ? "default" : "outline"}
                className={autoTransfer ? "bg-green-600 hover:bg-green-700" : "border-gray-700"}
              >
                {autoTransfer ? "Auto-Transfer Enabled" : "Enable Auto-Transfer"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

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
    </div>
  )
}
