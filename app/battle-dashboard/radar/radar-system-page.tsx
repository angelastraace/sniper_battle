"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import RadarChainCanvas from "@/components/radar-chain-canvas"
import RadarEnemyCanvas from "@/app/components/radar-enemy-canvas"
import RadarLiveFunding from "@/app/components/radar-live-funding"
import { useToast } from "@/hooks/use-toast"
import { Suspense } from "react"

export default function RadarSystemPage() {
  const { info } = useToast()

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-6 space-y-6 pb-20" // Added padding at the bottom for better scrolling
    >
      <h1 className="text-3xl font-bold text-white mb-6">Radar System</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Suspense fallback={<div className="h-60 bg-gray-900 animate-pulse rounded-xl"></div>}>
          <RadarChainCanvas />
        </Suspense>
        <Suspense fallback={<div className="h-60 bg-gray-900 animate-pulse rounded-xl"></div>}>
          <RadarEnemyCanvas />
        </Suspense>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Suspense fallback={<div className="h-60 bg-gray-900 animate-pulse rounded-xl"></div>}>
          <RadarLiveFunding />
        </Suspense>
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-purple-400">Radar Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 rounded-md bg-gray-800">
                <span>Scan Interval</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => info("Scan interval decreased")}
                    className="px-2 py-1 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors"
                  >
                    -
                  </button>
                  <span className="text-purple-400">2.5s</span>
                  <button
                    onClick={() => info("Scan interval increased")}
                    className="px-2 py-1 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 rounded-md bg-gray-800">
                <span>Detection Sensitivity</span>
                <select
                  onChange={() => info("Sensitivity changed")}
                  className="bg-gray-700 text-purple-400 rounded-md px-2 py-1 cursor-pointer"
                  defaultValue="High"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div className="flex justify-between items-center p-3 rounded-md bg-gray-800">
                <span>Alert Threshold</span>
                <select
                  onChange={() => info("Threshold changed")}
                  className="bg-gray-700 text-purple-400 rounded-md px-2 py-1 cursor-pointer"
                  defaultValue="Medium"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div className="flex justify-between items-center p-3 rounded-md bg-gray-800">
                <span>Auto-Response</span>
                <button
                  onClick={() => info("Auto-response toggled")}
                  className="px-3 py-1 bg-green-600 rounded-md hover:bg-green-700 transition-colors"
                >
                  Enabled
                </button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  )
}
