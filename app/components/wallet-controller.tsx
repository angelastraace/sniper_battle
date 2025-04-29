"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Wallet, Copy, ExternalLink, AlertCircle, ArrowRightLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface WalletControllerProps {
  chain: "ethereum" | "bsc" | "solana"
}

export default function WalletController({ chain }: WalletControllerProps) {
  const [walletAddress, setWalletAddress] = useState<string | null>(null)
  const [balance, setBalance] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    // Reset state when chain changes
    setWalletAddress(null)
    setBalance(null)
    setError(null)

    // Load saved wallet address from localStorage
    const savedAddress = localStorage.getItem(`${chain}-wallet-address`)
    if (savedAddress) {
      setWalletAddress(savedAddress)
      fetchBalance(savedAddress)
    }
  }, [chain])

  const fetchBalance = async (address: string) => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/wallet/${chain}/balance`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ address }),
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch balance: ${response.status}`)
      }

      const data = await response.json()
      setBalance(data.balance)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch balance")
    } finally {
      setLoading(false)
    }
  }

  const connectWallet = async () => {
    setLoading(true)
    setError(null)

    try {
      // This is a simplified example - in a real app, you'd use a wallet provider
      // like ethers.js, web3.js, or a wallet adapter for Solana

      // For demo purposes, we'll just prompt for an address
      const address = prompt("Enter your wallet address")

      if (!address) {
        throw new Error("No address provided")
      }

      // Save to localStorage
      localStorage.setItem(`${chain}-wallet-address`, address)

      setWalletAddress(address)
      await fetchBalance(address)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect wallet")
    } finally {
      setLoading(false)
    }
  }

  const disconnectWallet = () => {
    localStorage.removeItem(`${chain}-wallet-address`)
    setWalletAddress(null)
    setBalance(null)
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
              </div>
            </div>

            <div className="p-2 bg-gray-800 rounded text-xs font-mono break-all">{walletAddress}</div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Balance</span>
              <Badge variant="outline">{balance ? `${balance} ${getChainSymbol()}` : "Loading..."}</Badge>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">No wallet connected</div>
        )}
      </CardContent>
      <CardFooter>
        {walletAddress ? (
          <div className="grid grid-cols-2 gap-2 w-full">
            <Button variant="outline" size="sm" onClick={disconnectWallet}>
              Disconnect
            </Button>
            <Button variant="default" size="sm">
              <ArrowRightLeft className="mr-2 h-4 w-4" />
              Transfer
            </Button>
          </div>
        ) : (
          <Button variant="default" size="sm" onClick={connectWallet} className="w-full">
            Connect Wallet
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
