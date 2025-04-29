"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { motion } from "framer-motion"
import { ExternalLink } from "lucide-react"
import { BlockchainService, type Transaction } from "@/lib/blockchain-service"

export default function RealTimeTransactionFeed() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    const blockchainService = BlockchainService.getInstance()

    // Set loading state
    setLoading(true)
    setError(null)

    // Subscribe to Ethereum transactions
    const unsubscribeEth = blockchainService.subscribeToEthereumTransactions((tx) => {
      if (isMounted) {
        setTransactions((prev) => [tx, ...prev].slice(0, 20))
        setLoading(false)
      }
    })

    // Subscribe to Solana transactions
    const unsubscribeSol = blockchainService.subscribeToSolanaTransactions((tx) => {
      if (isMounted) {
        setTransactions((prev) => [tx, ...prev].slice(0, 20))
        setLoading(false)
      }
    })

    // If no transactions received within 15 seconds, show message
    const fallbackTimer = setTimeout(() => {
      if (isMounted && loading && transactions.length === 0) {
        setError("Waiting for live transactions. This may take a moment.")
        setLoading(false)
      }
    }, 15000)

    // Cleanup subscriptions
    return () => {
      isMounted = false
      if (unsubscribeEth) unsubscribeEth()
      if (unsubscribeSol) unsubscribeSol()
      clearTimeout(fallbackTimer)
    }
  }, [])

  const formatValue = (value: string, chain: string): string => {
    if (value === "N/A") return "N/A"
    return chain === "ethereum" ? `${value} ETH` : `${value} SOL`
  }

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="text-blue-400">Real-Time Transaction Feed</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
          </div>
        ) : (
          <div className="h-96 overflow-auto">
            {error && (
              <div className="mb-4 p-2 bg-yellow-900/30 border border-yellow-800 rounded text-yellow-400 text-sm">
                {error}
              </div>
            )}

            {transactions.length === 0 ? (
              <div className="text-center text-gray-500 py-4">No transactions detected yet</div>
            ) : (
              transactions.map((tx, index) => (
                <motion.div
                  key={`${tx.hash}-${index}`}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="text-sm text-white py-3 border-b border-gray-800 last:border-0"
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-400 font-bold">{tx.url.includes("etherscan") ? "Ξ" : "◎"}</span>
                      <span className="font-mono text-xs text-gray-400">
                        {new Date(tx.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <a
                      href={tx.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-xs"
                    >
                      View
                      <ExternalLink size={12} />
                    </a>
                  </div>

                  <div className="pl-6 text-xs space-y-1">
                    <div className="flex items-center gap-1">
                      <span className="text-gray-400">From:</span>
                      <span className="font-mono text-gray-300">
                        {tx.from.substring(0, 8)}...{tx.from.substring(tx.from.length - 6)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-gray-400">To:</span>
                      <span className="font-mono text-gray-300">
                        {tx.to.substring(0, 8)}...{tx.to.substring(tx.to.length - 6)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-gray-400">Value:</span>
                      <span className="font-mono text-green-400">
                        {formatValue(tx.value, tx.url.includes("etherscan") ? "ethereum" : "solana")}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
