"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowUp, TrendingUp, Zap } from "lucide-react"

interface SweepStats {
  successRate: number
  totalFound: number
  totalSwept: number
  totalValue: number
  activeOperations: number
}

export function LiveSweepStats() {
  const [stats, setStats] = useState<SweepStats>({
    successRate: 0,
    totalFound: 0,
    totalSwept: 0,
    totalValue: 0,
    activeOperations: 0,
  })

  // Simulate changing stats
  useEffect(() => {
    // Set initial stats
    setStats({
      successRate: 2.5,
      totalFound: 42,
      totalSwept: 18,
      totalValue: 0.85,
      activeOperations: 3,
    })

    // Update stats periodically
    const interval = setInterval(() => {
      setStats((prev) => {
        // Randomly decide which stats to update
        const shouldUpdateFound = Math.random() > 0.6
        const shouldUpdateSwept = Math.random() > 0.7
        const shouldUpdateValue = Math.random() > 0.7
        const shouldUpdateOperations = Math.random() > 0.9

        // Calculate new values
        const newFound = shouldUpdateFound ? prev.totalFound + 1 : prev.totalFound
        const newSwept = shouldUpdateSwept ? prev.totalSwept + 1 : prev.totalSwept
        const valueIncrement = Math.random() * 0.05
        const newValue = shouldUpdateValue ? prev.totalValue + valueIncrement : prev.totalValue
        const newOperations = shouldUpdateOperations
          ? Math.max(1, Math.min(5, prev.activeOperations + (Math.random() > 0.5 ? 1 : -1)))
          : prev.activeOperations

        // Calculate new success rate
        const newSuccessRate = newFound > 0 ? (newSwept / newFound) * 100 : 0

        return {
          successRate: newSuccessRate,
          totalFound: newFound,
          totalSwept: newSwept,
          totalValue: newValue,
          activeOperations: newOperations,
        }
      })
    }, 5000) // Update every 5 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-red-400">Sweep Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-400">Success Rate</p>
              <p className="text-2xl font-bold text-white">{stats.successRate.toFixed(2)}%</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-900/30">
              <TrendingUp className="h-6 w-6 text-red-400" />
            </div>
          </div>

          <div className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Progress</span>
              <span className="font-medium text-white">
                {stats.totalSwept}/{stats.totalFound}
              </span>
            </div>
            <Progress value={(stats.totalSwept / Math.max(1, stats.totalFound)) * 100} className="h-2" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-gray-400">Total Value</p>
              <p className="text-xl font-bold flex items-center text-white">
                ${stats.totalValue.toFixed(4)}
                <ArrowUp className="h-3 w-3 text-green-500 ml-1" />
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-gray-400">Active Operations</p>
              <p className="text-xl font-bold flex items-center text-white">
                {stats.activeOperations}
                <Zap className="h-4 w-4 text-yellow-500 ml-1" />
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
