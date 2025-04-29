"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, ArrowRight, CheckCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { config } from "@/lib/config"
import { sweepEthereumFunds, sweepBscFunds } from "@/app/utils/chain-sweeper"
import { sweepSolanaFunds } from "@/app/utils/chain-sweeper-solana"

export function ProfitTransferWidget() {
  const [activeTab, setActiveTab] = useState("ethereum")
  const [destinationAddress, setDestinationAddress] = useState({
    ethereum: process.env.DESTINATION_WALLET_ETH || config.destinationWallets.ethereum || "",
    solana: process.env.DESTINATION_WALLET_SOL || config.destinationWallets.solana || "",
    bsc: process.env.DESTINATION_WALLET_BNB || config.destinationWallets.bsc || "",
  })
  const [isTransferring, setIsTransferring] = useState(false)
  const [transferResult, setTransferResult] = useState<{
    success?: boolean
    message?: string
    txHash?: string
  }>({})

  const handleAddressChange = (chain: string, value: string) => {
    setDestinationAddress((prev) => ({
      ...prev,
      [chain]: value,
    }))
  }

  const handleTransfer = async () => {
    setIsTransferring(true)
    setTransferResult({})

    try {
      let result
      const address = destinationAddress[activeTab as keyof typeof destinationAddress]

      if (!address) {
        throw new Error("Please enter a valid destination address")
      }

      switch (activeTab) {
        case "ethereum":
          result = await sweepEthereumFunds(address)
          break
        case "solana":
          result = await sweepSolanaFunds(address)
          break
        case "bsc":
          result = await sweepBscFunds(address)
          break
        default:
          throw new Error("Invalid blockchain selected")
      }

      if (result.success) {
        setTransferResult({
          success: true,
          message: `Successfully transferred funds to ${address.substring(0, 6)}...${address.substring(
            address.length - 4,
          )}`,
          txHash: result.txHash,
        })
      } else {
        throw new Error(result.error || "Transfer failed")
      }
    } catch (error) {
      setTransferResult({
        success: false,
        message: error instanceof Error ? error.message : "An unknown error occurred",
      })
    } finally {
      setIsTransferring(false)
    }
  }

  const getExplorerUrl = (txHash?: string) => {
    if (!txHash) return "#"

    switch (activeTab) {
      case "ethereum":
        return `https://etherscan.io/tx/${txHash}`
      case "solana":
        return `https://solscan.io/tx/${txHash}`
      case "bsc":
        return `https://bscscan.com/tx/${txHash}`
      default:
        return "#"
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Transfer Profits</CardTitle>
        <CardDescription>Sweep funds to your secure wallet</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="ethereum">Ethereum</TabsTrigger>
            <TabsTrigger value="solana">Solana</TabsTrigger>
            <TabsTrigger value="bsc">BSC</TabsTrigger>
          </TabsList>
          <TabsContent value="ethereum" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="eth-address">Destination ETH Address</Label>
              <Input
                id="eth-address"
                placeholder="0x..."
                value={destinationAddress.ethereum}
                onChange={(e) => handleAddressChange("ethereum", e.target.value)}
              />
            </div>
          </TabsContent>
          <TabsContent value="solana" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="sol-address">Destination SOL Address</Label>
              <Input
                id="sol-address"
                placeholder="..."
                value={destinationAddress.solana}
                onChange={(e) => handleAddressChange("solana", e.target.value)}
              />
            </div>
          </TabsContent>
          <TabsContent value="bsc" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="bsc-address">Destination BNB Address</Label>
              <Input
                id="bsc-address"
                placeholder="0x..."
                value={destinationAddress.bsc}
                onChange={(e) => handleAddressChange("bsc", e.target.value)}
              />
            </div>
          </TabsContent>
        </Tabs>

        {transferResult.message && (
          <Alert
            className={`mt-4 ${
              transferResult.success
                ? "bg-green-50 text-green-800 border-green-200"
                : "bg-red-50 text-red-800 border-red-200"
            }`}
          >
            <div className="flex items-center gap-2">
              {transferResult.success ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600" />
              )}
              <AlertTitle>{transferResult.success ? "Success" : "Error"}</AlertTitle>
            </div>
            <AlertDescription className="mt-2">
              {transferResult.message}
              {transferResult.txHash && (
                <div className="mt-2">
                  <a
                    href={getExplorerUrl(transferResult.txHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 hover:text-blue-800"
                  >
                    View transaction <ArrowRight className="ml-1 h-3 w-3" />
                  </a>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleTransfer} disabled={isTransferring} className="w-full">
          {isTransferring ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Transferring...
            </>
          ) : (
            "Transfer Funds"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
