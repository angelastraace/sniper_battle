"use client"

import { useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ExternalLink, Wallet, ArrowRight } from "lucide-react"
import { formatPublicKey, formatSol } from "../utils/solana-utils"
import type { WalletResult } from "../services/scanner-service"

interface TransactionLogPanelProps {
  results: WalletResult[]
}

export default function TransactionLogPanel({ results }: TransactionLogPanelProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to the top when new logs arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = 0
    }
  }, [results.length])

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-white flex items-center">
          <Wallet className="mr-2 h-5 w-5" />
          Transaction Log
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4" ref={scrollAreaRef}>
          {results.length === 0 ? (
            <div className="text-center py-8 text-gray-400">No wallets found yet. Start scanning to begin.</div>
          ) : (
            <div className="space-y-3">
              {results.map((result, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    result.swept ? "bg-green-900/20 border-green-800" : "bg-amber-900/20 border-amber-800"
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-mono text-sm text-white">
                      {formatPublicKey(result.publicKey)}
                      <a
                        href={`https://explorer.solana.com/address/${result.publicKey}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block ml-1 text-blue-400 hover:text-blue-300"
                      >
                        <ExternalLink size={12} />
                      </a>
                    </div>
                    <Badge
                      className={result.swept ? "bg-green-600 hover:bg-green-700" : "bg-amber-600 hover:bg-amber-700"}
                    >
                      {result.swept ? "Swept" : "Found"}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-2 text-sm">
                    <div>
                      <span className="text-gray-400">Phrase:</span>{" "}
                      <span className="text-white font-mono">{result.phrase}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Balance:</span>{" "}
                      <span className="text-white font-mono">{formatSol(result.balance)} SOL</span>
                    </div>
                  </div>

                  {result.swept && result.explorerLink && (
                    <div className="mt-2 flex items-center text-sm">
                      <span className="text-gray-400 mr-2">Transaction:</span>
                      <ArrowRight className="h-3 w-3 text-green-500 mr-1" />
                      <a
                        href={result.explorerLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 flex items-center"
                      >
                        View on Solscan
                        <ExternalLink size={12} className="ml-1" />
                      </a>
                    </div>
                  )}

                  {result.error && (
                    <div className="mt-2 text-sm text-red-400">
                      <span className="text-gray-400">Error:</span> {result.error}
                    </div>
                  )}

                  <div className="mt-2 text-xs text-gray-500">{new Date(result.timestamp).toLocaleString()}</div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
