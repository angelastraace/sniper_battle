"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import SniperKillfeed from "@/app/components/sniper-killfeed"
import { useToast } from "@/hooks/use-toast"
import { useSniperService } from "@/hooks/use-sniper-service"
import { AlertCircle, CheckCircle } from "lucide-react"

export default function SniperControlPage() {
  const { toast } = useToast()
  const { status, metrics, logs, activateSniper, emergencyStop, isActivating, isEmergencyStopping } = useSniperService()

  // Show toast notification when status changes
  useEffect(() => {
    if (status.isActive) {
      toast({
        title: "Sniper Activated",
        description: "Sniper is now hunting for targets",
        variant: "default",
      })
    }
  }, [status.isActive, toast])

  // Format time since activation
  const getActivationTime = () => {
    if (!status.lastActivated) return "Not activated"

    const now = Date.now()
    const diff = now - status.lastActivated

    // Convert to hours, minutes, seconds
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((diff % (1000 * 60)) / 1000)

    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  // Update activation time display
  const [activationTime, setActivationTime] = useState(getActivationTime())

  useEffect(() => {
    // Update time every second if active
    if (status.isActive) {
      const interval = setInterval(() => {
        setActivationTime(getActivationTime())
      }, 1000)

      return () => clearInterval(interval)
    } else {
      setActivationTime("Not activated")
    }
  }, [status.isActive, status.lastActivated])

  const handleActivate = async () => {
    await activateSniper()
    toast.success("Sniper activated successfully!")
  }

  const handleEmergencyStop = async () => {
    await emergencyStop()
    toast.error("Sniper has been stopped")
  }

  return (
    <div className="p-6 space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white mb-6">Sniper Control</h1>

        {status.isActive && (
          <div className="flex items-center bg-green-900/30 text-green-400 px-4 py-2 rounded-md">
            <CheckCircle className="w-5 h-5 mr-2" />
            <div>
              <div className="text-sm font-medium">SNIPER ACTIVE</div>
              <div className="text-xs opacity-80">Running for {activationTime}</div>
            </div>
          </div>
        )}

        {!status.isActive && (
          <div className="flex items-center bg-gray-800/50 text-gray-400 px-4 py-2 rounded-md">
            <AlertCircle className="w-5 h-5 mr-2" />
            <div className="text-sm">SNIPER INACTIVE</div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle className="text-red-400">Sniper Control Center</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 text-center">
                    <div className="text-2xl mb-2">🎯</div>
                    <div className="text-sm text-gray-400">Target Acquisition</div>
                    <div className={`mt-2 ${status.isActive ? "text-green-400" : "text-gray-400"}`}>
                      {status.targetAcquisition}
                    </div>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 text-center">
                    <div className="text-2xl mb-2">⚡</div>
                    <div className="text-sm text-gray-400">Execution Speed</div>
                    <div className="text-yellow-400 mt-2">{status.executionSpeed}</div>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 text-center">
                    <div className="text-2xl mb-2">🛡️</div>
                    <div className="text-sm text-gray-400">Defense Systems</div>
                    <div className="text-blue-400 mt-2">{status.defenseSystems}</div>
                  </div>
                  <div className="bg-gray-800 p-4 rounded-xl border border-gray-700 text-center">
                    <div className="text-2xl mb-2">🔋</div>
                    <div className="text-sm text-gray-400">Power Level</div>
                    <div className="text-green-400 mt-2">{status.powerLevel}</div>
                  </div>
                </div>

                <div className="bg-black p-4 rounded-xl border border-gray-800 font-mono text-sm h-48 overflow-y-auto">
                  <div className="text-green-500">$ sniper --mode=auto --chains=ETH,SOL,BSC --gas=high</div>
                  <div className="text-gray-500 mt-2">Initializing auto-sniper on multiple chains...</div>
                  <div className="text-gray-500">Gas optimization set to HIGH priority</div>
                  <div className="text-gray-500">Wallet connections verified ✓</div>
                  <div className="text-gray-500">RPC endpoints connected ✓</div>
                  <div className="text-yellow-500 mt-2">
                    SYSTEM {status.isActive ? "ACTIVE - HUNTING" : "ARMED AND READY"}
                  </div>

                  {/* Display logs */}
                  {logs.map((log, index) => (
                    <div key={index} className="text-gray-400 mt-1">
                      {log}
                    </div>
                  ))}
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={handleActivate}
                    disabled={isActivating || status.isActive || isEmergencyStopping}
                    className={`flex-1 text-white py-2 px-4 rounded-md transition-all disabled:opacity-50 ${
                      isActivating
                        ? "bg-green-800 translate-y-0.5 shadow-inner"
                        : "bg-green-600 hover:bg-green-700 shadow-md"
                    }`}
                  >
                    {isActivating ? "ACTIVATING..." : "ACTIVATE SNIPER"}
                  </button>
                  <button
                    onClick={handleEmergencyStop}
                    disabled={isEmergencyStopping || !status.isActive || isActivating}
                    className={`flex-1 text-white py-2 px-4 rounded-md transition-all disabled:opacity-50 ${
                      isEmergencyStopping
                        ? "bg-red-800 translate-y-0.5 shadow-inner"
                        : "bg-red-600 hover:bg-red-700 shadow-md"
                    }`}
                  >
                    {isEmergencyStopping ? "STOPPING..." : "EMERGENCY STOP"}
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <SniperKillfeed />
        </div>
      </div>

      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-cyan-400">Sniper Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="text-sm text-gray-400">Success Rate</div>
              <div className="text-2xl text-cyan-400 font-mono">{metrics.successRate}%</div>
              <div className="w-full bg-gray-800 h-2 rounded-full">
                <div
                  className="bg-cyan-500 h-2 rounded-full"
                  style={{ width: `${Math.min(Number.parseFloat(metrics.successRate), 100)}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm text-gray-400">Average Response Time</div>
              <div className="text-2xl text-cyan-400 font-mono">{metrics.responseTime}s</div>
              <div className="w-full bg-gray-800 h-2 rounded-full">
                <div
                  className="bg-cyan-500 h-2 rounded-full"
                  style={{ width: `${Math.min(Number.parseFloat(metrics.responseTime) * 100, 100)}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-sm text-gray-400">Profit Margin</div>
              <div className="text-2xl text-cyan-400 font-mono">+{metrics.profitMargin}%</div>
              <div className="w-full bg-gray-800 h-2 rounded-full">
                <div
                  className="bg-cyan-500 h-2 rounded-full"
                  style={{ width: `${Math.min(Number.parseFloat(metrics.profitMargin), 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status indicator that shows the sniper is running in background */}
      {status.isActive && (
        <div className="fixed bottom-4 right-4 bg-green-900/80 text-green-400 px-4 py-2 rounded-md shadow-lg border border-green-700 z-50 flex items-center">
          <div className="w-3 h-3 bg-green-400 rounded-full mr-2 animate-pulse"></div>
          <div>
            <div className="text-sm font-medium">Sniper Running</div>
            <div className="text-xs opacity-80">Active for {activationTime}</div>
          </div>
        </div>
      )}
    </div>
  )
}
