"use client"

import { useState, useEffect } from "react"
import SniperService, { type SniperStatus, type SniperMetrics } from "@/lib/sniper-service"

export function useSniperService() {
  const [status, setStatus] = useState<SniperStatus>({
    isActive: false,
    targetAcquisition: "READY",
    executionSpeed: "TURBO",
    defenseSystems: "ACTIVE",
    powerLevel: "100%",
    lastActivated: null,
    activatedBy: null,
  })

  const [metrics, setMetrics] = useState<SniperMetrics>({
    successRate: "98.7",
    responseTime: "0.42",
    profitMargin: "24.5",
    lastUpdated: Date.now(),
  })

  const [logs, setLogs] = useState<string[]>([])
  const [isActivating, setIsActivating] = useState(false)
  const [isEmergencyStopping, setIsEmergencyStopping] = useState(false)

  useEffect(() => {
    // Get the singleton instance
    const sniperService = SniperService.getInstance()

    // Initialize state from service
    setStatus(sniperService.getStatus())
    setMetrics(sniperService.getMetrics())
    setLogs(sniperService.getLogs())

    // Subscribe to changes
    const unsubscribe = sniperService.subscribe(() => {
      setStatus(sniperService.getStatus())
      setMetrics(sniperService.getMetrics())
      setLogs(sniperService.getLogs())
    })

    // Cleanup subscription
    return () => {
      unsubscribe()
    }
  }, [])

  // Function to activate the sniper
  const activateSniper = async () => {
    try {
      setIsActivating(true)

      // Get the service instance
      const sniperService = SniperService.getInstance()

      // Activate the sniper
      sniperService.activateSniper()

      // Simulate activation delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setIsActivating(false)
    } catch (error) {
      console.error("Error activating sniper:", error)
      setIsActivating(false)
    }
  }

  // Function to emergency stop the sniper
  const emergencyStop = async () => {
    try {
      setIsEmergencyStopping(true)

      // Get the service instance
      const sniperService = SniperService.getInstance()

      // Stop the sniper
      sniperService.emergencyStop()

      // Simulate stop delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setIsEmergencyStopping(false)
    } catch (error) {
      console.error("Error stopping sniper:", error)
      setIsEmergencyStopping(false)
    }
  }

  return {
    status,
    metrics,
    logs,
    activateSniper,
    emergencyStop,
    isActivating,
    isEmergencyStopping,
  }
}
