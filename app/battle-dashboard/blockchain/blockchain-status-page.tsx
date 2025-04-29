"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import BlockchainStatus from "@/components/blockchain-status"
import RadarChainCanvas from "@/components/radar-chain-canvas"
import { useToast } from "@/hooks/use-toast"

export default function BlockchainStatusPage() {
  const { info } = useToast()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-6 space-y-6 pb-20" // Added padding at the bottom for better scrolling
    >
      <h1 className="text-3xl font-bold text-white mb-6">Blockchain Status</h1>

      <BlockchainStatus />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-blue-400">Gas Tracker</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-md bg-gray-800">
                <span>Ethereum</span>
                <div>
                  <button
                    onClick={() => info("Using low gas setting for Ethereum")}
                    className="text-green-400 mr-2 hover:underline"
                  >
                    Low: 25 Gwei
                  </button>
                  <button
                    onClick={() => info("Using medium gas setting for Ethereum")}
                    className="text-yellow-400 mr-2 hover:underline"
                  >
                    Med: 32 Gwei
                  </button>
                  <button
                    onClick={() => info("Using high gas setting for Ethereum")}
                    className="text-red-400 hover:underline"
                  >
                    High: 42 Gwei
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 rounded-md bg-gray-800">
                <span>BSC</span>
                <div>
                  <button
                    onClick={() => info("Using low gas setting for BSC")}
                    className="text-green-400 mr-2 hover:underline"
                  >
                    Low: 5 Gwei
                  </button>
                  <button
                    onClick={() => info("Using medium gas setting for BSC")}
                    className="text-yellow-400 mr-2 hover:underline"
                  >
                    Med: 5.5 Gwei
                  </button>
                  <button
                    onClick={() => info("Using high gas setting for BSC")}
                    className="text-red-400 hover:underline"
                  >
                    High: 6 Gwei
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 rounded-md bg-gray-800">
                <span>Polygon</span>
                <div>
                  <button
                    onClick={() => info("Using low gas setting for Polygon")}
                    className="text-green-400 mr-2 hover:underline"
                  >
                    Low: 30 Gwei
                  </button>
                  <button
                    onClick={() => info("Using medium gas setting for Polygon")}
                    className="text-yellow-400 mr-2 hover:underline"
                  >
                    Med: 50 Gwei
                  </button>
                  <button
                    onClick={() => info("Using high gas setting for Polygon")}
                    className="text-red-400 hover:underline"
                  >
                    High: 100 Gwei
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-blue-400">Network Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-md bg-gray-800">
                <span>Ethereum</span>
                <div className="flex items-center">
                  <button
                    onClick={() => info("Ethereum network details")}
                    className="text-green-400 mr-2 hover:underline"
                  >
                    Healthy
                  </button>
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 rounded-md bg-gray-800">
                <span>Solana</span>
                <div className="flex items-center">
                  <button
                    onClick={() => info("Solana network details")}
                    className="text-green-400 mr-2 hover:underline"
                  >
                    Healthy
                  </button>
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 rounded-md bg-gray-800">
                <span>BSC</span>
                <div className="flex items-center">
                  <button onClick={() => info("BSC network details")} className="text-yellow-400 mr-2 hover:underline">
                    Minor Delays
                  </button>
                  <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 rounded-md bg-gray-800">
                <span>Arbitrum</span>
                <div className="flex items-center">
                  <button
                    onClick={() => info("Arbitrum network details")}
                    className="text-green-400 mr-2 hover:underline"
                  >
                    Healthy
                  </button>
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <RadarChainCanvas />

      {/* Back to top button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg z-50"
        aria-label="Scroll to top"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m18 15-6-6-6 6" />
        </svg>
      </button>
    </motion.div>
  )
}
