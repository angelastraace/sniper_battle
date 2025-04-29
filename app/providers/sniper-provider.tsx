"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import sniperService from "@/services/sniperService"

// Define types for our context
export interface SniperTarget {
  id: string
  address: string
  network: string
  balance: string
  lastSeen: number
  status: "pending" | "active" | "completed" | "failed"
}

export interface SniperStats {
  targetsFound: number
  targetsSwept: number
  totalValueSwept: number
  activeTargets: number
}

interface SniperContextType {
  targets: SniperTarget[]
  stats: SniperStats
  addTarget: (address: string, network: string) => Promise<SniperTarget>
  removeTarget: (id: string) => Promise<boolean>
  activateTarget: (id: string) => Promise<boolean>
  sweepTarget: (id: string) => Promise<boolean>
  isLoading: boolean
}

const SniperContext = createContext<SniperContextType | undefined>(undefined)

export function SniperProvider({ children }: { children: React.ReactNode }) {
  const [targets, setTargets] = useState<SniperTarget[]>([])
  const [stats, setStats] = useState<SniperStats>({
    targetsFound: 0,
    targetsSwept: 0,
    totalValueSwept: 0,
    activeTargets: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Subscribe to targets updates
    const unsubscribeTargets = sniperService.subscribeToTargets((newTargets) => {
      setTargets(newTargets)
      setIsLoading(false)
    })

    // Subscribe to stats updates
    const unsubscribeStats = sniperService.subscribeToStats((newStats) => {
      setStats(newStats)
    })

    // Cleanup subscriptions on unmount
    return () => {
      unsubscribeTargets()
      unsubscribeStats()
    }
  }, [])

  // Pass through service methods to context
  const addTarget = async (address: string, network: string) => {
    return await sniperService.addTarget(address, network)
  }

  const removeTarget = async (id: string) => {
    return await sniperService.removeTarget(id)
  }

  const activateTarget = async (id: string) => {
    return await sniperService.activateTarget(id)
  }

  const sweepTarget = async (id: string) => {
    return await sniperService.sweepTarget(id)
  }

  return (
    <SniperContext.Provider
      value={{
        targets,
        stats,
        addTarget,
        removeTarget,
        activateTarget,
        sweepTarget,
        isLoading,
      }}
    >
      {children}
    </SniperContext.Provider>
  )
}

export function useSniperContext() {
  const context = useContext(SniperContext)
  if (context === undefined) {
    throw new Error("useSniperContext must be used within a SniperProvider")
  }
  return context
}
