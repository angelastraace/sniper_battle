"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"

export default function SimpleRpcTest() {
  const [ethResult, setEthResult] = useState<string>("Not tested")
  const [solResult, setSolResult] = useState<string>("Not tested")
  const [isLoading, setIsLoading] = useState(false)

  const testEthereum = async () => {
    setIsLoading(true)
    setEthResult("Testing...")

    try {
      const response = await fetch("/api/rpc/ethereum", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "eth_blockNumber",
          params: [],
          id: 1,
        }),
      })

      const data = await response.json()

      if (data.error) {
        setEthResult(`Error: ${JSON.stringify(data.error)}`)
      } else {
        const blockNumber = Number.parseInt(data.result, 16)
        setEthResult(`Success! Block #${blockNumber.toLocaleString()}`)
      }
    } catch (error) {
      setEthResult(`Fetch error: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const testSolana = async () => {
    setIsLoading(true)
    setSolResult("Testing...")

    try {
      const response = await fetch("/api/rpc/solana", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          method: "getSlot",
          params: [],
          id: 1,
        }),
      })

      const data = await response.json()

      if (data.error) {
        setSolResult(`Error: ${JSON.stringify(data.error)}`)
      } else {
        setSolResult(`Success! Slot #${data.result.toLocaleString()}`)
      }
    } catch (error) {
      setSolResult(`Fetch error: ${error.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const testHealthCheck = async () => {
    try {
      const response = await fetch("/api/health")
      const data = await response.json()
      alert(`Health check: ${JSON.stringify(data)}`)
    } catch (error) {
      alert(`Health check error: ${error.message}`)
    }
  }

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">Simple RPC Test</h1>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">API Health Check</h2>
        <Button onClick={testHealthCheck} className="w-full mb-2">
          Test API Health
        </Button>
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Ethereum RPC Test</h2>
        <Button onClick={testEthereum} disabled={isLoading} className="w-full mb-2">
          Test Ethereum RPC
        </Button>
        <div className="p-3 bg-gray-100 rounded">Result: {ethResult}</div>
      </div>

      <div>
        <h2 className="text-lg font-semibold mb-2">Solana RPC Test</h2>
        <Button onClick={testSolana} disabled={isLoading} className="w-full mb-2">
          Test Solana RPC
        </Button>
        <div className="p-3 bg-gray-100 rounded">Result: {solResult}</div>
      </div>
    </div>
  )
}
