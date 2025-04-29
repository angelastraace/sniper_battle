"use client"

import { useEffect, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { type SniperTransaction, getTransactions } from "@/app/utils/sniper-client"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

export function TransactionHistory() {
  const [transactions, setTransactions] = useState<SniperTransaction[]>([])
  const [loading, setLoading] = useState(true)

  const loadTransactions = async () => {
    setLoading(true)
    try {
      const data = await getTransactions(20)
      setTransactions(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTransactions()

    // Refresh every 30 seconds
    const interval = setInterval(loadTransactions, 30000)
    return () => clearInterval(interval)
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(date)
  }

  const getChainBadgeColor = (chain: string) => {
    switch (chain) {
      case "solana":
        return "bg-purple-100 text-purple-800"
      case "ethereum":
        return "bg-blue-100 text-blue-800"
      case "bsc":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const truncateAddress = (address: string) => {
    if (!address) return ""
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Transaction History</span>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            {loading ? "Loading transactions..." : "No transactions found"}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Chain</TableHead>
                  <TableHead>Token</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>
                      <Badge className={getChainBadgeColor(tx.chain)}>{tx.chain.toUpperCase()}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{tx.token_symbol || "Unknown"}</div>
                      <div className="text-xs text-gray-500">
                        <a
                          href={`https://${tx.chain === "solana" ? "solscan.io/token" : tx.chain === "ethereum" ? "etherscan.io/token" : "bscscan.com/token"}/${tx.token_address}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          {truncateAddress(tx.token_address)}
                        </a>
                      </div>
                    </TableCell>
                    <TableCell>
                      {tx.amount ? tx.amount.toFixed(4) : "N/A"} {tx.token_symbol}
                      <div className="text-xs text-gray-500">
                        {tx.input_amount ? tx.input_amount.toFixed(4) : "N/A"}{" "}
                        {tx.chain === "solana" ? "SOL" : tx.chain === "ethereum" ? "ETH" : "BNB"}
                      </div>
                    </TableCell>
                    <TableCell>{tx.price ? tx.price.toFixed(6) : "N/A"}</TableCell>
                    <TableCell>
                      {tx.success ? (
                        <div className="flex items-center text-green-600">
                          <CheckCircle size={16} className="mr-1" />
                          Success
                        </div>
                      ) : (
                        <div className="flex items-center text-red-600">
                          <XCircle size={16} className="mr-1" />
                          Failed
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">{formatDate(tx.timestamp)}</div>
                      <div className="text-xs text-gray-500">
                        <a
                          href={`https://${tx.chain === "solana" ? "solscan.io/tx" : tx.chain === "ethereum" ? "etherscan.io/tx" : "bscscan.com/tx"}/${tx.tx_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          View Transaction
                        </a>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
