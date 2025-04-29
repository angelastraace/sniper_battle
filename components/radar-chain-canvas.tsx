"use client"

import { useEffect, useState, useRef } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

interface ChainNode {
  id: string
  x: number
  y: number
  radius: number
  color: string
  name: string
  connections: string[]
}

export default function RadarChainCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [chains] = useState<ChainNode[]>([
    {
      id: "eth",
      x: 200,
      y: 150,
      radius: 30,
      color: "#627EEA",
      name: "Ethereum",
      connections: ["bsc", "polygon", "arbitrum"],
    },
    {
      id: "bsc",
      x: 350,
      y: 100,
      radius: 25,
      color: "#F3BA2F",
      name: "BSC",
      connections: ["eth", "polygon"],
    },
    {
      id: "polygon",
      x: 300,
      y: 250,
      radius: 22,
      color: "#8247E5",
      name: "Polygon",
      connections: ["eth", "bsc", "solana"],
    },
    {
      id: "solana",
      x: 450,
      y: 200,
      radius: 28,
      color: "#14F195",
      name: "Solana",
      connections: ["polygon", "arbitrum"],
    },
    {
      id: "arbitrum",
      x: 150,
      y: 250,
      radius: 20,
      color: "#28A0F0",
      name: "Arbitrum",
      connections: ["eth", "solana"],
    },
  ])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw connections
    ctx.lineWidth = 1
    chains.forEach((chain) => {
      chain.connections.forEach((connId) => {
        const connectedChain = chains.find((c) => c.id === connId)
        if (connectedChain) {
          ctx.beginPath()
          ctx.strokeStyle = `rgba(255, 255, 255, 0.2)`
          ctx.moveTo(chain.x, chain.y)
          ctx.lineTo(connectedChain.x, connectedChain.y)
          ctx.stroke()
        }
      })
    })

    // Draw nodes
    chains.forEach((chain) => {
      // Draw glow
      const gradient = ctx.createRadialGradient(chain.x, chain.y, 0, chain.x, chain.y, chain.radius * 2)
      gradient.addColorStop(0, chain.color)
      gradient.addColorStop(1, "rgba(0,0,0,0)")

      ctx.beginPath()
      ctx.fillStyle = gradient
      ctx.arc(chain.x, chain.y, chain.radius * 1.5, 0, Math.PI * 2)
      ctx.fill()

      // Draw node
      ctx.beginPath()
      ctx.fillStyle = chain.color
      ctx.arc(chain.x, chain.y, chain.radius, 0, Math.PI * 2)
      ctx.fill()

      // Draw border
      ctx.beginPath()
      ctx.strokeStyle = "rgba(255, 255, 255, 0.5)"
      ctx.lineWidth = 2
      ctx.arc(chain.x, chain.y, chain.radius, 0, Math.PI * 2)
      ctx.stroke()

      // Draw label
      ctx.font = "12px monospace"
      ctx.fillStyle = "white"
      ctx.textAlign = "center"
      ctx.fillText(chain.name, chain.x, chain.y + chain.radius + 20)
    })

    // Animation - pulse effect
    let pulseSize = 0
    let increasing = true

    const animate = () => {
      if (increasing) {
        pulseSize += 0.5
        if (pulseSize >= 15) increasing = false
      } else {
        pulseSize -= 0.5
        if (pulseSize <= 0) increasing = true
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw connections
      chains.forEach((chain) => {
        chain.connections.forEach((connId) => {
          const connectedChain = chains.find((c) => c.id === connId)
          if (connectedChain) {
            ctx.beginPath()
            ctx.strokeStyle = `rgba(255, 255, 255, 0.2)`
            ctx.moveTo(chain.x, chain.y)
            ctx.lineTo(connectedChain.x, connectedChain.y)
            ctx.stroke()
          }
        })
      })

      // Draw nodes with pulse
      chains.forEach((chain) => {
        // Draw pulse
        ctx.beginPath()
        ctx.fillStyle = `${chain.color}33`
        ctx.arc(chain.x, chain.y, chain.radius + pulseSize, 0, Math.PI * 2)
        ctx.fill()

        // Draw node
        ctx.beginPath()
        ctx.fillStyle = chain.color
        ctx.arc(chain.x, chain.y, chain.radius, 0, Math.PI * 2)
        ctx.fill()

        // Draw border
        ctx.beginPath()
        ctx.strokeStyle = "rgba(255, 255, 255, 0.5)"
        ctx.lineWidth = 2
        ctx.arc(chain.x, chain.y, chain.radius, 0, Math.PI * 2)
        ctx.stroke()

        // Draw label
        ctx.font = "12px monospace"
        ctx.fillStyle = "white"
        ctx.textAlign = "center"
        ctx.fillText(chain.name, chain.x, chain.y + chain.radius + 20)
      })

      requestAnimationFrame(animate)
    }

    const animationId = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [chains])

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="text-cyan-400">Chain Radar Network</CardTitle>
      </CardHeader>
      <CardContent>
        <canvas ref={canvasRef} width={600} height={300} className="w-full h-auto bg-black rounded-lg" />
      </CardContent>
    </Card>
  )
}
