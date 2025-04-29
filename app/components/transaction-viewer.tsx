"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, AlertCircle, ExternalLink } from "lucide-react"

export default function TransactionViewer() {
  const [txHash, setTxHash] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [txData, setTxData] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("ethereum")

  const handleSearch = async () => {
    if (!txHash.trim()) {
      setError("Please enter a transaction hash")
      return
    }

    setLoading(true)
    setError(null)
    setTxData(null)

    try {
      // This would be a real API call in production
      // For now, we'll simulate a response
      await new Promise((resolve) => setTimeout(resolve, 1500))

      if (Math.random() > 0.2) {
        setTxData({
          hash: txHash,
          blockNumber: 18245632,
          from: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
          to: "0x388C818CA8B9251b393131C08a736A67ccB19297",
          value: "0.05 ETH",
          gasUsed: 21000,
          timestamp: new Date().toISOString(),
          status: "success",
        })
      } else {
        setError("Transaction not found")
      }
    } catch (err) {
      setError("Failed to fetch transaction data")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getExplorerLink = () => {
    if (!txHash) return "#"

    if (activeTab === "ethereum") {
      return `https://etherscan.io/tx/${txHash}`
    } else if (activeTab === "solana") {
      return `https://explorer.solana.com/tx/${txHash}`
    } else {
      return `https://bscscan.com/tx/${txHash}`
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction Viewer</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="ethereum">Ethereum</TabsTrigger>
            <TabsTrigger value="solana">Solana</TabsTrigger>
            <TabsTrigger value="bsc">BSC</TabsTrigger>
          </TabsList>

          <div className="flex space-x-2 mb-4">
            <Input
              placeholder="Enter transaction hash"
              value={txHash}
              onChange={(e) => setTxHash(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
            </Button>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {txData && (
            <div className="border rounded-md p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Transaction Details</h3>
                <a
                  href={getExplorerLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 flex items-center text-sm"
                >
                  View on Explorer <ExternalLink size={14} className="ml-1" />
                </a>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Hash</p>
                  <p className="font-mono text-sm truncate">{txData.hash}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Block</p>
                  <p>{txData.blockNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">From</p>
                  <p className="font-mono text-sm truncate">{txData.from}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">To</p>
                  <p className="font-mono text-sm truncate">{txData.to}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Value</p>
                  <p>{txData.value}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Gas Used</p>
                  <p>{txData.gasUsed}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Timestamp</p>
                  <p>{new Date(txData.timestamp).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className={txData.status === "success" ? "text-green-600" : "text-red-600"}>
                    {txData.status === "success" ? "Success" : "Failed"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </Tabs>
      </CardContent>
    </Card>
  )
}
