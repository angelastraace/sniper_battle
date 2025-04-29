"use client"

import { Suspense } from "react"
import dynamic from "next/dynamic"
import Image from "next/image"

// Dynamically import heavy components
const LiveWidgets = dynamic(() => import("@/components/live-widgets"), {
  suspense: true,
  loading: () => <div className="h-40 bg-gray-900 animate-pulse rounded-xl"></div>,
})

const RadarChainCanvas = dynamic(() => import("@/components/radar-chain-canvas"), {
  suspense: true,
  loading: () => <div className="h-60 bg-gray-900 animate-pulse rounded-xl"></div>,
})

const FuturisticBattleDashboard = dynamic(() => import("@/components/futuristic-battle-dashboard"), {
  suspense: true,
  loading: () => <div className="h-40 bg-gray-900 animate-pulse rounded-xl"></div>,
})

export default function OptimizedDashboard({ sniperStats }: { sniperStats?: any }) {
  return (
    <div className="space-y-8 bg-black text-white min-h-screen p-6">
      {/* Logo with optimized image */}
      <div className="flex justify-center mb-6">
        <div className="relative w-64 h-16">
          <Image src="/eagle-eye-sniper.png" alt="ACE Sniper Logo" fill priority className="object-contain" />
        </div>
      </div>

      {/* Glowing Title */}
      <h1 className="text-4xl font-bold animate-glow mb-6 text-center">Welcome to Battle Station 🚀</h1>

      {/* Pre-loaded stats display */}
      {sniperStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {Object.entries(sniperStats).map(([key, value]) => (
            <div key={key} className="bg-gray-900 p-4 rounded-xl border border-gray-800">
              <div className="text-gray-400 text-sm">{key}</div>
              <div className="text-cyan-400 text-xl font-mono">{String(value)}</div>
            </div>
          ))}
        </div>
      )}

      {/* Grid Layout for Widgets with Suspense */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Live Widgets Card */}
        <section className="card">
          <h2 className="text-2xl mb-4 animate-glow">🚀 Live Blockchain Radar</h2>
          <Suspense fallback={<div className="h-40 bg-gray-900 animate-pulse rounded-xl"></div>}>
            <LiveWidgets />
          </Suspense>
        </section>

        {/* Radar Widget Card */}
        <section className="card">
          <h2 className="text-2xl mb-4 animate-glow">🛰️ Radar Activity</h2>
          <Suspense fallback={<div className="h-40 bg-gray-900 animate-pulse rounded-xl"></div>}>
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-gray-900 p-4 rounded-xl border border-gray-800">
                <div className="text-green-400 text-lg">Monitoring Active</div>
                <div className="text-gray-400 text-sm mt-2">Chains: ETH, SOL, BSC</div>
              </div>
            </div>
          </Suspense>
        </section>
      </div>

      {/* Single Section for Canvas with Suspense */}
      <section className="card mt-8">
        <h2 className="text-2xl mb-4 animate-glow">🌐 Radar Chain Visualizer</h2>
        <Suspense fallback={<div className="h-60 bg-gray-900 animate-pulse rounded-xl"></div>}>
          <RadarChainCanvas />
        </Suspense>
      </section>

      {/* Single Section for Futuristic Dashboard with Suspense */}
      <section className="card mt-8">
        <h2 className="text-2xl mb-4 animate-glow">🔮 Futuristic Dashboard</h2>
        <Suspense fallback={<div className="h-40 bg-gray-900 animate-pulse rounded-xl"></div>}>
          <FuturisticBattleDashboard />
        </Suspense>
      </section>
    </div>
  )
}
