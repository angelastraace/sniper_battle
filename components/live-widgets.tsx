"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"
import { Zap, TrendingUp, AlertTriangle, Shield } from "lucide-react"

export default function LiveWidgets() {
  const [activeAlerts, setActiveAlerts] = useState(0)
  const [scanSpeed, setScanSpeed] = useState(0)
  const [securityLevel, setSecurityLevel] = useState("MAXIMUM")
  const [systemStatus, setSystemStatus] = useState("ONLINE")

  useEffect(() => {
    // Simulate changing stats
    const interval = setInterval(() => {
      setActiveAlerts(Math.floor(Math.random() * 5))
      setScanSpeed(Math.floor(Math.random() * 500) + 500)

      // Occasionally change security level and status for effect
      if (Math.random() > 0.8) {
        setSecurityLevel(Math.random() > 0.5 ? "MAXIMUM" : "ENHANCED")
      }

      if (Math.random() > 0.95) {
        setSystemStatus(Math.random() > 0.8 ? "ONLINE" : "SCANNING")
      }
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-blue-400">Live System Status</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gray-900 border-blue-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-blue-400 flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Scan Speed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <motion.div
              key={scanSpeed}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-2xl font-bold text-blue-300 font-mono"
            >
              {scanSpeed} tx/s
            </motion.div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-yellow-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-yellow-400 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Active Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <motion.div
              key={activeAlerts}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-2xl font-bold text-yellow-300 font-mono"
            >
              {activeAlerts}
            </motion.div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-green-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-green-400 flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Security Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <motion.div
              key={securityLevel}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-2xl font-bold text-green-300 font-mono"
            >
              {securityLevel}
            </motion.div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-purple-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-purple-400 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              System Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <motion.div
              key={systemStatus}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-2xl font-bold text-purple-300 font-mono"
            >
              {systemStatus}
            </motion.div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
