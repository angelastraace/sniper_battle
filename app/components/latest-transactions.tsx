"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, ExternalLink } from "lucide-react"
import { BlockchainService, type Transaction } from "@/lib/blockchain-service"

export default function LatestTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true)
      try {
        const blockchainService = BlockchainService.getInstance()

        // Get a sample address to fetch transactions for
        // In a real app, you might want to use a specific address of interest
        const sampleAddress = process.env.DESTINATION_WALLET_ETH || "0x388C818CA8B9251b393131C08a736A67ccB19297"

        // Fetch real Ethereum transactions
        const ethTxs = await blockchainService.getEthereumTransactions(sampleAddress, 5)

        setTransactions(ethTxs)
      } catch (err) {
        console.error("Failed to fetch transactions:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchTransactions()

    // Set up subscription to new transactions
    const blockchainService = BlockchainService.getInstance()
    const unsubscribe = blockchainService.subscribeToEthereumTransactions((tx) => {
      setTransactions((prev) => {
        // Add new transaction to the beginning and limit to 5
        return [tx, ...prev].slice(0, 5)
      })
    })

    return () => {
      unsubscribe()
    }
  }, [])

  const formatAddress = (address: string) => {
    if (!address) return "Unknown"
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Latest Transactions</span>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            {loading ? "Loading transactions..." : "No transactions found"}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Hash</TableHead>
                <TableHead>From</TableHead>
                <TableHead>To</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.hash}>
                  <TableCell className="font-mono">
                    <a
                      href={tx.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-600 hover:text-blue-800"
                    >
                      {formatAddress(tx.hash)}
                      <ExternalLink size={12} className="ml-1" />
                    </a>
                  </TableCell>
                  <TableCell className="font-mono">{formatAddress(tx.from)}</TableCell>
                  <TableCell className="font-mono">{formatAddress(tx.to)}</TableCell>
                  <TableCell>{tx.value}</TableCell>
                  <TableCell>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      success
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
