"use client"

import dynamic from "next/dynamic"
import { Suspense, useState, useEffect } from "react"
import { motion } from "framer-motion"

// Use dynamic imports with SSR disabled for components that use WebSocket connections
const BlockchainStatus = dynamic(() => import("@/components/blockchain-status"), {
  ssr: false,
  loading: () => <div className="h-40 bg-gray-900 animate-pulse rounded-xl"></div>,
})

const RadarChainCanvas = dynamic(() => import("@/components/radar-chain-canvas"), {
  ssr: false,
})

const RadarLiveFunding = dynamic(() => import("@/app/components/radar-live-funding"), {
  ssr: false,
  loading: () => <div className="h-60 bg-gray-900 animate-pulse rounded-xl"></div>,
})

const SniperKillfeed = dynamic(() => import("@/app/components/sniper-killfeed"), {
  ssr: false,
  loading: () => <div className="h-60 bg-gray-900 animate-pulse rounded-xl"></div>,
})

// This component doesn't make blockchain calls, so we can load it normally
const RealTimeTransactionFeed = dynamic(() => import("@/components/real-time-transaction-feed"), {
  loading: () => <div className="h-60 bg-gray-900 animate-pulse rounded-xl"></div>,
})

export default function BattleDashboardClient() {
  const [isClient, setIsClient] = useState(false)

  // Only render components that use WebSockets on the client side
  useEffect(() => {
    setIsClient(true)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-6 space-y-6 pb-20" // Added padding at the bottom for better scrolling
    >
      <h1 className="text-3xl font-bold text-white mb-6">Battle Dashboard Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {isClient ? (
          <Suspense fallback={<div className="h-40 bg-gray-900 animate-pulse rounded-xl"></div>}>
            <BlockchainStatus />
          </Suspense>
        ) : (
          <div className="h-40 bg-gray-900 animate-pulse rounded-xl"></div>
        )}

        <Suspense fallback={<div className="h-60 bg-gray-900 animate-pulse rounded-xl"></div>}>
          <RealTimeTransactionFeed />
        </Suspense>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {isClient && (
          <>
            <Suspense fallback={<div className="h-60 bg-gray-900 animate-pulse rounded-xl"></div>}>
              <RadarLiveFunding />
            </Suspense>
            <Suspense fallback={<div className="h-60 bg-gray-900 animate-pulse rounded-xl"></div>}>
              <SniperKillfeed />
            </Suspense>
          </>
        )}
      </div>

      {isClient && (
        <div className="mb-6">
          <Suspense fallback={<div className="h-60 bg-gray-900 animate-pulse rounded-xl"></div>}>
            <RadarChainCanvas />
          </Suspense>
        </div>
      )}
    </motion.div>
  )
}
