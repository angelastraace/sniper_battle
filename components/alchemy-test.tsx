"use client"

import { useState, useEffect } from "react"
import { alchemy } from "@/lib/alchemy-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"

export function AlchemyTest() {
  const [blockNumber, setBlockNumber] = useState<number | null>(null)
  const [blockData, setBlockData] = useState<any | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchBlockNumber = async () => {
    setLoading(true)
    setError(null)
    try {
      const number = await alchemy.core.getBlockNumber()
      setBlockNumber(number)
      console.log("Latest block number:", number)
    } catch (err) {
      setError(err.message)
      console.error("Error fetching block number:", err)
    } finally {
      setLoading(false)
    }
  }

  const fetchBlockData = async () => {
    if (!blockNumber) return

    setLoading(true)
    setError(null)
    try {
      const block = await alchemy.core.getBlock(blockNumber)
      setBlockData(block)
      console.log("Block data:", block)
    } catch (err) {
      setError(err.message)
      console.error("Error fetching block data:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBlockNumber()
  }, [])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Alchemy SDK Proxy Test</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && <div className="p-3 bg-red-100 border border-red-300 rounded text-red-800">Error: {error}</div>}

        <div className="space-y-2">
          <div className="font-medium">Latest Block Number:</div>
          {loading && !blockNumber ? (
            <div className="flex items-center">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Loading...
            </div>
          ) : blockNumber ? (
            <div className="font-mono bg-gray-100 p-2 rounded">{blockNumber.toLocaleString()}</div>
          ) : (
            <div>No data</div>
          )}
        </div>

        {blockNumber && (
          <Button onClick={fetchBlockData} disabled={loading || !blockNumber} variant="outline" className="w-full">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Loading Block Data...
              </>
            ) : (
              `Fetch Block ${blockNumber.toLocaleString()} Data`
            )}
          </Button>
        )}

        {blockData && (
          <div className="space-y-2 mt-4">
            <div className="font-medium">Block Data:</div>
            <div className="bg-gray-100 p-3 rounded overflow-auto max-h-80">
              <pre className="text-xs">{JSON.stringify(blockData, null, 2)}</pre>
            </div>
          </div>
        )}

        <Button onClick={fetchBlockNumber} disabled={loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Refreshing...
            </>
          ) : (
            "Refresh Block Number"
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
