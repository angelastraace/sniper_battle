"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import SniperService from "@/lib/sniper-service"

export default function SniperKillfeed() {
  const [kills, setKills] = useState<
    Array<{
      id: string
      token: string
      chain: string
      profit: string
      time: string
    }>
  >([])

  useEffect(() => {
    // Get the singleton instance
    const sniperService = SniperService.getInstance()

    // Get logs and parse for kills
    const logs = sniperService.getLogs()
    const parsedKills = logs
      .filter((log) => log.includes("Successfully sniped"))
      .map((log, index) => {
        // Extract token name and profit from log
        const match = log.match(/Successfully sniped (\w+) with ([\d.]+)% profit/)
        if (!match) return null

        const [_, token, profit] = match

        // Extract timestamp
        const timeMatch = log.match(/\[(.*?)\]/)
        const time = timeMatch ? new Date(timeMatch[1]).toLocaleTimeString() : new Date().toLocaleTimeString()

        // Randomly assign a chain
        const chains = ["ETH", "SOL", "BSC"]
        const chain = chains[Math.floor(Math.random() * chains.length)]

        return {
          id: `kill-${index}-${Date.now()}`,
          token,
          chain,
          profit: `${profit}%`,
          time,
        }
      })
      .filter(Boolean) as Array<{
      id: string
      token: string
      chain: string
      profit: string
      time: string
    }>

    setKills(parsedKills)

    // Subscribe to changes
    const unsubscribe = sniperService.subscribe(() => {
      const logs = sniperService.getLogs()
      const parsedKills = logs
        .filter((log) => log.includes("Successfully sniped"))
        .map((log, index) => {
          // Extract token name and profit from log
          const match = log.match(/Successfully sniped (\w+) with ([\d.]+)% profit/)
          if (!match) return null

          const [_, token, profit] = match

          // Extract timestamp
          const timeMatch = log.match(/\[(.*?)\]/)
          const time = timeMatch ? new Date(timeMatch[1]).toLocaleTimeString() : new Date().toLocaleTimeString()

          // Randomly assign a chain
          const chains = ["ETH", "SOL", "BSC"]
          const chain = chains[Math.floor(Math.random() * chains.length)]

          return {
            id: `kill-${index}-${Date.now()}`,
            token,
            chain,
            profit: `${profit}%`,
            time,
          }
        })
        .filter(Boolean) as Array<{
        id: string
        token: string
        chain: string
        profit: string
        time: string
      }>

      setKills(parsedKills)
    })

    // Cleanup subscription
    return () => {
      unsubscribe()
    }
  }, [])

  return (
    <Card className="bg-gray-900 border-gray-800 h-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-red-400">Killfeed</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[300px] overflow-y-auto">
          {kills.length === 0 ? (
            <div className="text-gray-500 text-center py-4">No kills yet</div>
          ) : (
            kills.map((kill) => (
              <div
                key={kill.id}
                className="bg-gray-800 p-3 rounded-lg border border-gray-700 flex items-center justify-between"
              >
                <div className="flex items-center">
                  <div className="bg-red-900/30 text-red-400 w-8 h-8 rounded-full flex items-center justify-center mr-3">
                    🎯
                  </div>
                  <div>
                    <div className="font-medium text-white">{kill.token}</div>
                    <div className="text-xs text-gray-400">
                      {kill.chain} • {kill.time}
                    </div>
                  </div>
                </div>
                <div className="text-green-400 font-mono">+{kill.profit}</div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
