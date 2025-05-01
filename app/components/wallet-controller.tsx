"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Wallet, Copy, ExternalLink, AlertCircle, ArrowRightLeft, Pencil, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface WalletControllerProps {
  chain: "ethereum" | "bsc" | "solana"
}

interface Transaction {
  signature: string
  timestamp: string | null
  status: string
  fee?: number
  blockTime?: number
  type?: string
  amount?: number | null
}

export default function WalletController({ chain }: WalletControllerProps) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [balance, setBalance] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loadingTx, setLoadingTx] = useState(false)
  const [txError, setTxError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    // Reset state when chain changes
    setWalletAddress(null)
    setBalance(null)
    setError(null)
    setTransactions([])
    setTxError(null)

    // Load saved wallet address from localStorage
    const savedAddress = localStorage.getItem(`${chain}-wallet-address`)
    if (savedAddress) {
      setWalletAddress(savedAddress)
      fetchBalance(savedAddress)
      fetchTransactions(savedAddress)
    }
  }, [chain])

  const fetchBalance = async (address: string) => {
    setLoading(true)
    setError(null)

    try {
      // Get the appropriate RPC endpoint based on the chain
      const endpoint = chain === "ethereum" ? "/api/rpc/eth" : chain === "solana" ? "/api/solana" : "/api/rpc/bsc"

      // Create the appropriate RPC payload based on the chain
      let rpcPayload

      if (chain === "ethereum" || chain === "bsc") {
        rpcPayload = {
          jsonrpc: "2.0",
          id: 1,
          method: "eth_getBalance",
          params: [address, "latest"],
        }
      } else if (chain === "solana") {
        rpcPayload = {
          jsonrpc: "2.0",
          id: 1,
          method: "getBalance",
          params: [address],
        }
      }

      console.log(`Fetching ${chain} balance for ${address} from ${endpoint}`)

      // Make sure we have the full URL with origin for client-side requests
      const fullUrl = typeof window !== "undefined" ? `${window.location.origin}${endpoint}` : endpoint

      const response = await fetch(fullUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(rpcPayload),
        cache: "no-store",
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch balance: ${response.status}`)
      }

      const data = await response.json()
      console.log(`${chain} balance response:`, data)

      // Process the response based on the chain
      let formattedBalance

      if (chain === "ethereum" || chain === "bsc") {
        // Convert hex result to decimal and format as ETH/BNB
        const wei = Number.parseInt(data.result, 16)
        formattedBalance = (wei / 1e18).toFixed(4)
      } else if (chain === "solana") {
        // Format SOL balance (lamports to SOL)
        if (data.result && typeof data.result.value === "number") {
          formattedBalance = (data.result.value / 1e9).toFixed(4)
        } else {
          console.error("Invalid Solana balance response:", data)
          throw new Error("Invalid Solana balance format")
        }
      }

      setBalance(formattedBalance)
    } catch (err) {
      console.error(`Error fetching ${chain} balance:`, err)
      setError(err instanceof Error ? err.message : "Failed to fetch balance")
    } finally {
      setLoading(false)
    }
  }

  const fetchTransactions = async (address: string) => {
    if (!address) return

    setLoadingTx(true)
    setTxError(null)

    try {
      let endpoint = ""

      // Select the appropriate endpoint based on the chain
      if (chain === "solana") {
        endpoint = "/api/transactions/solana"
      } else if (chain === "ethereum") {
        endpoint = "/api/transactions/ethereum"
      } else if (chain === "bsc") {
        endpoint = "/api/transactions/bsc"
      }

      if (!endpoint) {
        throw new Error("Unsupported chain for transaction fetching")
      }

      console.log(`Fetching ${chain} transactions for ${address} from ${endpoint}`)

      // Make sure we have the full URL with origin for client-side requests
      const fullUrl = typeof window !== "undefined" ? `${window.location.origin}${endpoint}` : endpoint

      const response = await fetch(fullUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ address }),
        cache: "no-store",
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch transactions: ${response.status}`)
      }

      const data = await response.json()
      console.log(`${chain} transactions response:`, data)

      if (Array.isArray(data.transactions)) {
        setTransactions(data.transactions)
      } else {
        console.error("Invalid transaction response format:", data)
        setTransactions([])
      }
    } catch (err) {
      console.error(`Error fetching ${chain} transactions:`, err)
      setTxError(err instanceof Error ? err.message : "Failed to fetch transactions")
    } finally {
      setLoadingTx(false)
    }
  }

  const connectWallet = async () => {
    setLoading(true)
    setError(null)

    try {
      // For demo purposes, we'll just prompt for an address
      const address = prompt("Enter your wallet address")

      if (!address) {
        throw new Error("No address provided")
      }

      // Save to localStorage
      localStorage.setItem(`${chain}-wallet-address`, address)

      setWalletAddress(address)
      await fetchBalance(address)
      await fetchTransactions(address)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect wallet")
    } finally {
      setLoading(false)
    }
  }

  const savePrivateKey = () => {
    const privateKey = prompt("Enter your private key (stored locally only)")

    if (privateKey) {
      localStorage.setItem(`${chain}-private-key`, privateKey)
      toast({
        title: "Private key saved",
        description: "Your private key has been saved locally",
      })
    }
  }

  const hasPrivateKey = () => {
    return !!localStorage.getItem(`${chain}-private-key`)
  }

  const getMaskedPrivateKey = () => {
    const key = localStorage.getItem(`${chain}-private-key`)
    if (!key) return null
    return key.substring(0, 6) + "..." + key.substring(key.length - 4)
  }

  const disconnectWallet = () => {
    localStorage.removeItem(`${chain}-wallet-address`)
    setWalletAddress(null)
    setBalance(null)
    setTransactions([])
  }

  const copyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress)
      toast({
        title: "Address copied",
        description: "Wallet address copied to clipboard",
      })
    }
  }

  const getChainExplorer = () => {
    switch (chain) {
      case "ethereum":
        return "https://etherscan.io/address/"
      case "bsc":
        return "https://bscscan.com/address/"
      case "solana":
        return "https://solscan.io/account/"
      default:
        return ""
    }
  }

  const getTransactionExplorer = () => {
    switch (chain) {
      case "ethereum":
        return "https://etherscan.io/tx/"
      case "bsc":
        return "https://bscscan.com/tx/"
      case "solana":
        return "https://solscan.io/tx/"
      default:
        return ""
    }
  }

  const getChainSymbol = () => {
    switch (chain) {
      case "ethereum":
        return "ETH"
      case "bsc":
        return "BNB"
      case "solana":
        return "SOL"
      default:
        return ""
    }
  }

  const formatDate = (timestamp: string | null) => {
    if (!timestamp) return "Unknown"
    return new Date(timestamp).toLocaleString()
  }

  // Function to handle transfer button click
  const handleTransfer = () => {
    alert("Transfer functionality is not implemented yet")
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center">
          <Wallet className="mr-2 h-5 w-5" />
          {chain.charAt(0).toUpperCase() + chain.slice(1)} Wallet
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center py-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : walletAddress ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Address</span>
              <div className="flex items-center space-x-1">
                <Button variant="ghost" size="icon" onClick={copyAddress}>
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" asChild>
                  <a href={`${getChainExplorer()}${walletAddress}`} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const newAddress = prompt("Edit wallet address", walletAddress)
                    if (newAddress && newAddress !== walletAddress) {
                      localStorage.setItem(`${chain}-wallet-address`, newAddress)
                      setWalletAddress(newAddress)
                      fetchBalance(newAddress)
                      fetchTransactions(newAddress)
                    }
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="p-2 bg-gray-800 rounded text-xs font-mono break-all">{walletAddress}</div>

            <div className="flex justify-between items-center mt-4">
              <span className="text-sm font-medium">Private Key</span>
              <div className="flex items-center space-x-1">
                {hasPrivateKey() && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const key = localStorage.getItem(`${chain}-private-key`)
                      if (key) {
                        navigator.clipboard.writeText(key)
                        toast({
                          title: "Private key copied",
                          description: "Private key copied to clipboard",
                        })
                      }
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const newKey = prompt("Enter private key", localStorage.getItem(`${chain}-private-key`) || "")
                    if (newKey) {
                      localStorage.setItem(`${chain}-private-key`, newKey)
                      toast({
                        title: "Private key updated",
                        description: "Your private key has been updated",
                      })
                    }
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="p-2 bg-gray-800 rounded text-xs font-mono break-all">
              {hasPrivateKey() ? getMaskedPrivateKey() : "No private key configured"}
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Balance</span>
              <Badge variant="outline">{balance ? `${balance} ${getChainSymbol()}` : "Loading..."}</Badge>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">No wallet connected</div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-4">
        {walletAddress ? (
          <>
            <div className="grid grid-cols-2 gap-2 w-full">
              <Button variant="outline" size="sm" onClick={disconnectWallet}>
                Disconnect
              </Button>
              <Button variant="default" size="sm" onClick={handleTransfer}>
                <ArrowRightLeft className="mr-2 h-4 w-4" />
                Transfer
              </Button>
            </div>

            <div className="w-full">
              <h3 className="text-sm font-medium mb-2">Recent Transactions</h3>
              {loadingTx ? (
                <div className="flex justify-center items-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                </div>
              ) : txError ? (
                <Alert variant="destructive" className="py-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs">{txError}</AlertDescription>
                </Alert>
              ) : transactions.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {transactions.map((tx) => (
                    <div key={tx.signature} className="p-2 bg-gray-800 rounded text-xs">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <Badge variant={tx.status === "success" ? "success" : "destructive"} className="mr-2">
                            {tx.type || "Transaction"}
                          </Badge>
                          <span className="font-mono">{tx.signature.substring(0, 8)}...</span>
                        </div>
                        <Button variant="ghost" size="icon" asChild className="h-6 w-6">
                          <a
                            href={`${getTransactionExplorer()}${tx.signature}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </Button>
                      </div>
                      <div className="flex justify-between mt-1 text-gray-400">
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDate(tx.timestamp)}
                        </div>
                        {tx.amount !== null && (
                          <span className={tx.amount && tx.amount > 0 ? "text-green-400" : "text-red-400"}>
                            {tx.amount > 0 ? "+" : ""}
                            {tx.amount} {getChainSymbol()}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground text-sm">No recent transactions</div>
              )}

              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2"
                onClick={() => fetchTransactions(walletAddress)}
                disabled={loadingTx}
              >
                {loadingTx ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Refresh Transactions
              </Button>
            </div>
          </>
        ) : (
          <Button variant="default" size="sm" onClick={connectWallet} className="w-full">
            Connect Wallet
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
