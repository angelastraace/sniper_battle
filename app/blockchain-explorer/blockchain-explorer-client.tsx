"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import BlockchainApiService, {
  type Block,
  type Transaction,
  type ChainStats,
  type TokenInfo,
} from "@/lib/blockchain-api-service"
import EthereumExplorer from "./ethereum-explorer"
import SolanaExplorer from "./solana-explorer"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { XCircleIcon } from "lucide-react"
import { useBlockchainConnection } from "@/lib/blockchain-connection-manager"

export default function BlockchainExplorerClient() {
  const [activeTab, setActiveTab] = useState("ethereum")
  const [ethBlocks, setEthBlocks] = useState<Block[]>([])
  const [ethTransactions, setEthTransactions] = useState<Transaction[]>([])
  const [ethStats, setEthStats] = useState<ChainStats | null>(null)
  const [ethTokenInfo, setEthTokenInfo] = useState<TokenInfo | null>(null)

  const [solBlocks, setSolBlocks] = useState<Block[]>([])
  const [solTransactions, setSolTransactions] = useState<Transaction[]>([])
  const [solStats, setSolStats] = useState<ChainStats | null>(null)
  const [solTokenInfo, setSolTokenInfo] = useState<TokenInfo | null>(null)

  const [isClient, setIsClient] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const { status } = useBlockchainConnection()

  useEffect(() => {
    setIsClient(true)
    setIsLoading(true)

    // Initialize blockchain service
    const blockchainService = BlockchainApiService.getInstance()

    // Subscribe to Ethereum updates
    const unsubEthBlocks = blockchainService.subscribeToEthereumBlocks((blocks) => {
      setEthBlocks(blocks)
    })

    const unsubEthTxs = blockchainService.subscribeToEthereumTransactions((txs) => {
      setEthTransactions(txs)
    })

    // Subscribe to Solana updates
    const unsubSolBlocks = blockchainService.subscribeToSolanaBlocks((blocks) => {
      setSolBlocks(blocks)
    })

    const unsubSolTxs = blockchainService.subscribeToSolanaTransactions((txs) => {
      setSolTransactions(txs)
    })

    // Set up interval to fetch stats
    const statsInterval = setInterval(() => {
      setEthStats(blockchainService.getEthereumStats())
      setSolStats(blockchainService.getSolanaStats())
      setEthTokenInfo(blockchainService.getEthereumTokenInfo())
      setSolTokenInfo(blockchainService.getSolanaTokenInfo())
      setIsLoading(false)
    }, 1000)

    // Initial stats fetch
    setEthStats(blockchainService.getEthereumStats())
    setSolStats(blockchainService.getSolanaStats())
    setEthTokenInfo(blockchainService.getEthereumTokenInfo())
    setSolTokenInfo(blockchainService.getSolanaTokenInfo())

    // Set loading to false after initial data fetch
    setTimeout(() => {
      setIsLoading(false)
    }, 2000)

    // Cleanup
    return () => {
      unsubEthBlocks()
      unsubEthTxs()
      unsubSolBlocks()
      unsubSolTxs()
      clearInterval(statsInterval)
    }
  }, [])

  if (!isClient) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-6">
      <h1 className="text-3xl font-bold mb-6">Blockchain Explorer</h1>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Link href="/blockchain-explorer/solana-stablecoin">
          <Card className="bg-gray-900 border-gray-800 hover:bg-gray-800 transition-colors cursor-pointer h-full">
            <CardContent className="p-4 flex items-center">
              <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center mr-3">
                <span className="text-xl">$</span>
              </div>
              <div>
                <div className="font-medium">Solana Stablecoin Network</div>
                <div className="text-sm text-gray-400">Explore stablecoin stats</div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/blockchain-explorer/amm/raydium">
          <Card className="bg-gray-900 border-gray-800 hover:bg-gray-800 transition-colors cursor-pointer h-full">
            <CardContent className="p-4 flex items-center">
              <div className="w-10 h-10 rounded-full bg-purple-600 flex items-center justify-center mr-3">
                <span className="text-xl">R</span>
              </div>
              <div>
                <div className="font-medium">Raydium AMM</div>
                <div className="text-sm text-gray-400">Explore Raydium pools and stats</div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="#">
          <Card className="bg-gray-900 border-gray-800 hover:bg-gray-800 transition-colors cursor-pointer h-full">
            <CardContent className="p-4 flex items-center">
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center mr-3">
                <span className="text-xl">Ξ</span>
              </div>
              <div>
                <div className="font-medium">Ethereum DeFi</div>
                <div className="text-sm text-gray-400">Explore Ethereum DeFi protocols</div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="#">
          <Card className="bg-gray-900 border-gray-800 hover:bg-gray-800 transition-colors cursor-pointer h-full">
            <CardContent className="p-4 flex items-center">
              <div className="w-10 h-10 rounded-full bg-orange-600 flex items-center justify-center mr-3">
                <span className="text-xl">₿</span>
              </div>
              <div>
                <div className="font-medium">Bitcoin Explorer</div>
                <div className="text-sm text-gray-400">Explore Bitcoin blockchain</div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Connection Status Alerts */}
      {status.ethereum !== "connected" && activeTab === "ethereum" && (
        <Alert className="bg-red-900/20 border-red-800 mb-4">
          <XCircleIcon className="h-4 w-4 text-red-500 mr-2" />
          <AlertTitle>Ethereum Connection Error</AlertTitle>
          <AlertDescription>
            Unable to connect to Ethereum network. Using fallback data or showing cached information.
          </AlertDescription>
        </Alert>
      )}

      {status.solana !== "connected" && activeTab === "solana" && (
        <Alert className="bg-red-900/20 border-red-800 mb-4">
          <XCircleIcon className="h-4 w-4 text-red-500 mr-2" />
          <AlertTitle>Solana Connection Error</AlertTitle>
          <AlertDescription>
            Unable to connect to Solana network. Using fallback data or showing cached information.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="ethereum" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-8">
          <TabsTrigger value="ethereum">Ethereum</TabsTrigger>
          <TabsTrigger value="solana">Solana</TabsTrigger>
        </TabsList>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-lg">Loading blockchain data...</span>
          </div>
        ) : (
          <>
            <TabsContent value="ethereum">
              <EthereumExplorer
                blocks={ethBlocks}
                transactions={ethTransactions}
                stats={ethStats}
                tokenInfo={ethTokenInfo}
                isConnected={status.ethereum === "connected"}
              />
            </TabsContent>

            <TabsContent value="solana">
              <SolanaExplorer
                blocks={solBlocks}
                transactions={solTransactions}
                stats={solStats}
                tokenInfo={solTokenInfo}
                isConnected={status.solana === "connected"}
              />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  )
}
