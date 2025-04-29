// /frontend/components/radar-widget.tsx

"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Activity } from "lucide-react"

export default function RadarWidget() {
  return (
    <Card className="bg-black text-white border-gray-700 shadow-lg rounded-xl">
      <CardHeader>
        <CardTitle className="text-lg text-green-400 flex items-center gap-2">
          <Activity className="h-5 w-5 animate-pulse" />
          Live Radar Feed
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-gray-400 space-y-2">
          <p>Monitoring chains: Ethereum, Solana, BSC...</p>
          <p>Auto-detecting funding events, snipes, and more 🚀</p>
          <p className="text-xs text-green-500">Radar Status: ACTIVE</p>
        </div>
      </CardContent>
    </Card>
  )
}
