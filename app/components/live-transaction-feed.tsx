"use client"

import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowUpRight, ArrowDownLeft, AlertCircle, CheckCircle, Clock } from "lucide-react"
import { BlockchainService, type Transaction } from "@/lib/blockchain-service"

// Transaction types
type TransactionStatus = "pending" | "completed" | "failed"
type TransactionType = "sweep" | "scan" | "discovery" | "transfer"
type ChainType = "ETH" | "SOL" | "BSC"

interface EnhancedTransaction extends Transaction {
  type: TransactionType
  status: TransactionStatus
  chain: ChainType
  message: string
}

export function LiveTransactionFeed() {
  const [transactions, setTransactions] = useState<EnhancedTransaction[]>([])
  const [stats, setStats] = useState({
    totalSwept: 0,
    successRate: 0,
    activeScans: 0,
  })

  // Subscribe to real blockchain transactions
  useEffect(() => {
    const blockchainService = BlockchainService.getInstance()

    // Process a transaction and add it to our state
    const processTransaction = (tx: Transaction, chain: ChainType) => {
      // Determine transaction type based on analysis of the transaction
      const type: TransactionType = determineTransactionType(tx)

      // Create enhanced transaction with additional metadata
      const enhancedTx: EnhancedTransaction = {
        ...tx,
        type,
        status: "completed", // Assume completed for real transactions
        chain,
        message: generateTransactionMessage(tx, type),
      }

      setTransactions((prev) => {
        // Add new transaction to the beginning and limit to 20
        const updated = [enhancedTx, ...prev].slice(0, 20)
        return updated
      })

      // Update stats based on transaction
      updateStats(enhancedTx)
    }

    // Subscribe to Ethereum transactions
    const unsubscribeEth = blockchainService.subscribeToEthereumTransactions((tx) => {
      processTransaction(tx, "ETH")
    })

    // Subscribe to Solana transactions
    const unsubscribeSol = blockchainService.subscribeToSolanaTransactions((tx) => {
      processTransaction(tx, "SOL")
    })

    // Subscribe to BSC transactions
    const unsubscribeBsc = blockchainService.subscribeToBscTransactions((tx) => {
      processTransaction(tx, "BSC")
    })

    return () => {
      unsubscribeEth()
      unsubscribeSol()
      unsubscribeBsc()
    }
  }, [])

  // Helper function to determine transaction type
  const determineTransactionType = (tx: Transaction): TransactionType => {
    // This is a simplified implementation
    // In a real app, you would analyze the transaction data more thoroughly

    // For now, randomly assign a type for demonstration
    const types: TransactionType[] = ["sweep", "transfer", "discovery", "scan"]
    return types[Math.floor(Math.random() * types.length)]
  }

  // Helper function to generate a message for the transaction
  const generateTransactionMessage = (tx: Transaction, type: TransactionType): string => {
    switch (type) {
      case "sweep":
        return `Sweeping funds from wallet`
      case "scan":
        return `Scanning blockchain for opportunities`
      case "discovery":
        return `Found wallet with balance`
      case "transfer":
        return `Transferring funds to secure wallet`
      default:
        return `Transaction processed`
    }
  }

  // Update stats based on new transaction
  const updateStats = (tx: EnhancedTransaction) => {
    setStats((prev) => {
      let newSwept = prev.totalSwept
      let successCount = 0
      let totalCount = 0

      if (tx.type === "sweep" && tx.status === "completed") {
        // Extract numeric value from the transaction value string
        const valueMatch = tx.value.match(/[\d.]+/)
        if (valueMatch) {
          newSwept += Number.parseFloat(valueMatch[0])
        }
      }

      // Calculate success rate
      transactions.forEach((t) => {
        if (t.status !== "pending") {
          totalCount++
          if (t.status === "completed") {
            successCount++
          }
        }
      })

      const newSuccessRate = totalCount > 0 ? (successCount / totalCount) * 100 : 0

      return {
        totalSwept: newSwept,
        successRate: newSuccessRate,
        activeScans: prev.activeScans, // This would be updated elsewhere
      }
    })
  }

  // Format timestamp to HH:MM:SS
  const formatTime = (date: Date | number) => {
    const d = new Date(date)
    return d.toTimeString().split(" ")[0]
  }

  // Get status icon
  const getStatusIcon = (status: TransactionStatus) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
    }
  }

  // Get transaction icon
  const getTypeIcon = (type: TransactionType, status: TransactionStatus) => {
    if (type === "sweep" || type === "transfer") {
      return <ArrowUpRight className={`h-4 w-4 ${status === "completed" ? "text-green-500" : "text-gray-500"}`} />
    }
    return <ArrowDownLeft className={`h-4 w-4 ${status === "completed" ? "text-blue-500" : "text-gray-500"}`} />
  }

  // Get chain color
  const getChainColor = (chain: ChainType) => {
    switch (chain) {
      case "ETH":
        return "bg-blue-100 text-blue-800"
      case "SOL":
        return "bg-purple-100 text-purple-800"
      case "BSC":
        return "bg-yellow-100 text-yellow-800"
    }
  }

  // Format address for display
  const formatAddress = (address: string) => {
    if (!address) return "Unknown"
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
  }

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-green-400">Live Transactions</CardTitle>
        <div className="flex space-x-2 text-sm text-gray-400">
          <div className="flex items-center">
            <div className="h-2 w-2 rounded-full bg-green-500 mr-1"></div>
            <span>{stats.activeScans} Active</span>
          </div>
          <div>|</div>
          <div>${stats.totalSwept.toFixed(4)} Swept</div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {transactions.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">Waiting for transactions...</div>
          ) : (
            transactions.map((tx, index) => (
              <div
                key={`${tx.hash}-${index}`}
                className="flex items-center justify-between border-b border-gray-800 p-3 hover:bg-gray-800"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-800">
                    {getTypeIcon(tx.type, tx.status)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-gray-300">{tx.message}</p>
                      <Badge variant="outline" className={getChainColor(tx.chain)}>
                        {tx.chain}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span>
                        {formatAddress(tx.from)} → {formatAddress(tx.to)}
                      </span>
                      <span>{tx.value}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(tx.status)}
                    <span className="text-xs capitalize text-gray-400">{tx.status}</span>
                  </div>
                  <span className="text-xs text-gray-500">[{formatTime(tx.timestamp)}]</span>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
