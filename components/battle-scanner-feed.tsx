"use client"

import { useState } from "react"
import { useBattleScanner } from "../hooks/use-battle-scanner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function BattleScannerFeed() {
  const { targets, isConnected, activateTarget } = useBattleScanner()
  const [activeTab, setActiveTab] = useState("all")

  // Filter targets based on active tab
  const filteredTargets = activeTab === "all" ? targets : targets.filter((target) => target.type === activeTab)

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Battle Scanner</CardTitle>
        <Badge variant={isConnected ? "success" : "destructive"}>{isConnected ? "Connected" : "Disconnected"}</Badge>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="mint">Mints</TabsTrigger>
            <TabsTrigger value="liquidity">Liquidity</TabsTrigger>
            <TabsTrigger value="swap">Swaps</TabsTrigger>
            <TabsTrigger value="target_wallet">Wallets</TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {filteredTargets.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No {activeTab === "all" ? "" : activeTab} targets detected yet
              </div>
            ) : (
              <div className="space-y-2">
                {filteredTargets.map((target) => (
                  <TargetCard key={target.id} target={target} onActivate={activateTarget} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

function TargetCard({
  target,
  onActivate,
}: {
  target: any
  onActivate: (id: string) => void
}) {
  // Format time
  const timeString = new Date(target.time).toLocaleTimeString()

  // Get icon based on type
  const getIcon = () => {
    switch (target.type) {
      case "mint":
        return "🎯"
      case "liquidity":
        return "💧"
      case "swap":
        return "🐋"
      case "target_wallet":
        return "👁️"
      default:
        return "⚡"
    }
  }

  // Get status color
  const getStatusColor = () => {
    switch (target.status) {
      case "detected":
        return "bg-yellow-500"
      case "active":
        return "bg-blue-500"
      case "completed":
        return "bg-green-500"
      case "failed":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="border rounded-md p-3 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="text-2xl">{getIcon()}</div>
        <div>
          <div className="font-medium">
            {target.type.charAt(0).toUpperCase() + target.type.slice(1)} in slot {target.slot}
          </div>
          <div className="text-sm text-muted-foreground">
            {timeString} •{" "}
            {target.tokenAddress ? `Token: ${target.tokenAddress.slice(0, 6)}...` : target.details?.dex || ""}
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <div className={`w-3 h-3 rounded-full ${getStatusColor()}`}></div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => onActivate(target.id)}
          disabled={target.status !== "detected"}
        >
          Activate
        </Button>
      </div>
    </div>
  )
}
