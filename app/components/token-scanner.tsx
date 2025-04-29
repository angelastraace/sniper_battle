"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Search, ExternalLink, AlertCircle } from "lucide-react"

interface TokenInfo {
  address: string
  name: string
  symbol: string
  decimals: number
  totalSupply: string
  owner: string
  isHoneypot: boolean
  buyTax: string
  sellTax: string
  riskLevel: "low" | "medium" | "high"
  createdAt: string
  holders: number
  verified: boolean
}

export default function TokenScanner() {
  const [tokenAddress, setTokenAddress] = useState("")
  const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [network, setNetwork] = useState<"ethereum" | "bsc">("ethereum")

  const scanToken = async () => {
    if (!tokenAddress || tokenAddress.length < 42) {
      setError("Please enter a valid token address")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/tokens/scan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address: tokenAddress,
          network,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to scan token: ${response.status}`)
      }

      const data = await response.json()
      setTokenInfo(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to scan token")
    } finally {
      setLoading(false)
    }
  }

  const handleNetworkChange = (newNetwork: "ethereum" | "bsc") => {
    setNetwork(newNetwork)
    setTokenInfo(null)
  }

  const getRiskBadgeVariant = (risk: "low" | "medium" | "high") => {
    switch (risk) {
      case "low":
        return "bg-green-900/20 text-green-400 border-green-800"
      case "medium":
        return "bg-yellow-900/20 text-yellow-400 border-yellow-800"
      case "high":
        return "bg-red-900/20 text-red-400 border-red-800"
      default:
        return ""
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center">
          <Search className="mr-2 h-5 w-5" />
          Token Scanner
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between mb-4">
          <Button
            variant={network === "ethereum" ? "default" : "outline"}
            size="sm"
            onClick={() => handleNetworkChange("ethereum")}
          >
            Ethereum
          </Button>
          <Button
            variant={network === "bsc" ? "default" : "outline"}
            size="sm"
            onClick={() => handleNetworkChange("bsc")}
          >
            BSC
          </Button>
        </div>

        <div className="flex space-x-2 mb-4">
          <Input
            placeholder="Enter token address"
            value={tokenAddress}
            onChange={(e) => setTokenAddress(e.target.value)}
          />
          <Button onClick={scanToken} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Scan"}
          </Button>
        </div>

        {error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : tokenInfo ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-medium">{tokenInfo.name}</h3>
                <div className="text-sm text-muted-foreground">{tokenInfo.symbol}</div>
              </div>
              <Badge variant="outline" className={getRiskBadgeVariant(tokenInfo.riskLevel)}>
                {tokenInfo.riskLevel.toUpperCase()} RISK
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-muted-foreground">Address</div>
              <div className="truncate">{tokenInfo.address}</div>

              <div className="text-muted-foreground">Decimals</div>
              <div>{tokenInfo.decimals}</div>

              <div className="text-muted-foreground">Total Supply</div>
              <div>{tokenInfo.totalSupply}</div>

              <div className="text-muted-foreground">Owner</div>
              <div className="truncate">{tokenInfo.owner}</div>

              <div className="text-muted-foreground">Honeypot</div>
              <div>{tokenInfo.isHoneypot ? "Yes ⚠️" : "No ✅"}</div>

              <div className="text-muted-foreground">Buy Tax</div>
              <div>{tokenInfo.buyTax}</div>

              <div className="text-muted-foreground">Sell Tax</div>
              <div>{tokenInfo.sellTax}</div>

              <div className="text-muted-foreground">Created</div>
              <div>{new Date(tokenInfo.createdAt).toLocaleDateString()}</div>

              <div className="text-muted-foreground">Holders</div>
              <div>{tokenInfo.holders.toLocaleString()}</div>

              <div className="text-muted-foreground">Verified</div>
              <div>{tokenInfo.verified ? "Yes ✅" : "No ⚠️"}</div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">Enter a token address to scan</div>
        )}
      </CardContent>
      {tokenInfo && (
        <CardFooter>
          <Button variant="outline" size="sm" className="w-full" asChild>
            <a
              href={`${network === "ethereum" ? "https://etherscan.io/token/" : "https://bscscan.com/token/"}${tokenInfo.address}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              View on {network === "ethereum" ? "Etherscan" : "BscScan"}
            </a>
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
