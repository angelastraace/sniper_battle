"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, ExternalLink } from "lucide-react"
import { ethers } from "ethers"

interface Block {
  number: number
  hash: string
  timestamp: number
  transactions: number
  miner: string
}

export default function LatestBlocks() {
  const [blocks, setBlocks] = useState<Block[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchBlocks = async () => {
      setLoading(true)
      try {
        // Connect to Ethereum mainnet
        const provider = new ethers.JsonRpcProvider(
          process.env.ETHEREUM_RPC || "https://eth-mainnet.g.alchemy.com/v2/demo",
        )

        // Get current block number
        const currentBlockNumber = await provider.getBlockNumber()

        // Fetch the last 5 blocks
        const blockPromises = []
        for (let i = 0; i < 5; i++) {
          blockPromises.push(provider.getBlock(currentBlockNumber - i))
        }

        const fetchedBlocks = await Promise.all(blockPromises)

        // Transform blocks to our format
        const formattedBlocks: Block[] = fetchedBlocks
          .filter((block) => block !== null)
          .map((block) => ({
            number: Number(block!.number),
            hash: block!.hash || "",
            timestamp: Number(block!.timestamp) * 1000, // Convert to milliseconds
            transactions: block!.transactions.length,
            miner: block!.miner || "",
          }))

        setBlocks(formattedBlocks)
      } catch (err) {
        console.error("Failed to fetch blocks:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchBlocks()

    // Refresh every 30 seconds
    const interval = setInterval(fetchBlocks, 30000)
    return () => clearInterval(interval)
  }, [])

  const formatAddress = (address: string) => {
    if (!address) return "Unknown"
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffSeconds < 60) {
      return `${diffSeconds} sec ago`
    } else if (diffSeconds < 3600) {
      return `${Math.floor(diffSeconds / 60)} min ago`
    } else {
      return `${Math.floor(diffSeconds / 3600)} hr ago`
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Latest Blocks</span>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {blocks.length === 0 ? (
          <div className="text-center py-4 text-gray-500">{loading ? "Loading blocks..." : "No blocks found"}</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Block</TableHead>
                <TableHead>Hash</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Txs</TableHead>
                <TableHead>Miner</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {blocks.map((block) => (
                <TableRow key={block.number}>
                  <TableCell>
                    <a
                      href={`https://etherscan.io/block/${block.number}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-600 hover:text-blue-800"
                    >
                      {block.number}
                      <ExternalLink size={12} className="ml-1" />
                    </a>
                  </TableCell>
                  <TableCell className="font-mono">{formatAddress(block.hash)}</TableCell>
                  <TableCell>{formatTime(block.timestamp)}</TableCell>
                  <TableCell>{block.transactions}</TableCell>
                  <TableCell className="font-mono">{formatAddress(block.miner)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
