"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"

export default function FuturisticBattleDashboard() {
  const [stats, setStats] = useState({
    successRate: 0,
    tokensScanned: 0,
    activeSnipes: 0,
    profitToday: 0,
  })

  useEffect(() => {
    // Simulate increasing stats
    const interval = setInterval(() => {
      setStats((prev) => ({
        successRate: Math.min(98, prev.successRate + Math.random()),
        tokensScanned: prev.tokensScanned + Math.floor(Math.random() * 10),
        activeSnipes: Math.floor(Math.random() * 5) + 1,
        profitToday: prev.profitToday + Math.random() * 0.05,
      }))
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-cyan-400">Battle Command Center</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gray-900 border-cyan-800">
          <CardHeader>
            <CardTitle className="text-cyan-400">Battle Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between">
                <span className="text-gray-400">Success Rate:</span>
                <motion.span
                  className="text-green-400 font-mono"
                  key={stats.successRate}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {stats.successRate.toFixed(2)}%
                </motion.span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Tokens Scanned:</span>
                <motion.span
                  className="text-blue-400 font-mono"
                  key={stats.tokensScanned}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {stats.tokensScanned.toLocaleString()}
                </motion.span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Active Snipes:</span>
                <motion.span
                  className="text-yellow-400 font-mono"
                  key={stats.activeSnipes}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {stats.activeSnipes}
                </motion.span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Profit Today:</span>
                <motion.span
                  className="text-green-400 font-mono"
                  key={stats.profitToday}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  ${stats.profitToday.toFixed(2)}
                </motion.span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-purple-800">
          <CardHeader>
            <CardTitle className="text-purple-400">Battle Log</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 font-mono text-xs h-48 overflow-y-auto">
              {Array.from({ length: 10 }).map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="text-gray-400"
                >
                  <span className="text-purple-500">[{new Date().toLocaleTimeString()}]</span> System operation {i + 1}{" "}
                  completed
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
