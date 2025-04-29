"use client"

import dynamic from "next/dynamic"
import { Suspense } from "react"
import { motion } from "framer-motion"

const FuturisticBattleDashboard = dynamic(() => import("@/components/futuristic-battle-dashboard"), {
  suspense: true,
})
const LiveWidgets = dynamic(() => import("@/components/live-widgets"), {
  suspense: true,
})
const RadarWidget = dynamic(() => import("@/components/radar-widget"), {
  suspense: true,
})
const RadarChainCanvas = dynamic(() => import("@/components/radar-chain-canvas"), {
  suspense: true,
})

export default function BattleDashboardClientPage() {
  return (
    <Suspense fallback={<div>Loading dashboard...</div>}>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="space-y-8 bg-black text-white min-h-screen p-6"
      >
        <section className="rounded-xl border border-gray-800 p-6 bg-gradient-to-r from-blue-900 via-purple-900 to-black shadow-lg">
          <LiveWidgets />
        </section>

        <section className="rounded-xl border border-gray-800 p-6 bg-gradient-to-r from-green-900 via-blue-900 to-black shadow-lg">
          <RadarWidget />
        </section>

        <section className="rounded-xl border border-gray-800 p-6 bg-gradient-to-r from-purple-900 via-pink-900 to-black shadow-lg">
          <RadarChainCanvas />
        </section>

        <section className="rounded-xl border border-gray-800 p-6 bg-gradient-to-r from-purple-900 via-pink-900 to-black shadow-lg">
          <FuturisticBattleDashboard />
        </section>
      </motion.div>
    </Suspense>
  )
}
