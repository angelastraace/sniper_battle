"use client"

import type React from "react"

import { useEffect } from "react"
import { BlockchainConnectionManager } from "@/lib/blockchain-connection-manager"

export default function ConnectionProvider({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    const connectionManager = BlockchainConnectionManager.getInstance()
    connectionManager.initialize()

    return () => {
      connectionManager.cleanup()
    }
  }, [])

  return <>{children}</>
}
