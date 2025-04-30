"use client"

import { useState, useEffect } from "react"
import type { BattleTarget } from "../lib/battle-scanner-service"

export function useBattleScanner() {
  const [targets, setTargets] = useState<BattleTarget[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [socket, setSocket] = useState<WebSocket | null>(null)

  useEffect(() => {
    // Connect to WebSocket
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL || `ws://${window.location.hostname}:3001`
    const ws = new WebSocket(wsUrl)

    ws.onopen = () => {
      console.log("🛰️ Connected to Battle Scanner WebSocket")
      setIsConnected(true)

      // Request initial targets
      ws.send(JSON.stringify({ action: "getTargets" }))
    }

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)

        if (Array.isArray(data)) {
          if (data.length === 1) {
            // Single target update
            setTargets((prev) => {
              // Check if target already exists
              const exists = prev.some((t) => t.id === data[0].id)
              if (exists) {
                // Update existing target
                return prev.map((t) => (t.id === data[0].id ? data[0] : t))
              } else {
                // Add new target
                return [...prev, data[0]]
              }
            })
          } else {
            // Full targets list
            setTargets(data)
          }
        }
      } catch (error) {
        console.error("Error processing WebSocket message:", error)
      }
    }

    ws.onclose = () => {
      console.log("Disconnected from Battle Scanner WebSocket")
      setIsConnected(false)
    }

    ws.onerror = (error) => {
      console.error("Battle Scanner WebSocket error:", error)
    }

    setSocket(ws)

    // Cleanup on unmount
    return () => {
      ws.close()
    }
  }, [])

  // Function to activate a target
  const activateTarget = (targetId: string) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(
        JSON.stringify({
          action: "activateTarget",
          targetId,
        }),
      )
    }
  }

  return {
    targets,
    isConnected,
    activateTarget,
  }
}
