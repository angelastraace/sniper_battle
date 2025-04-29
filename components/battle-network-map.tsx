"use client"

import { useEffect, useRef } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

interface Node {
  id: string
  x: number
  y: number
  radius: number
  color: string
  name: string
  connections: string[]
}

export default function BattleNetworkMap() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Define nodes
    const nodes: Node[] = [
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
    ]

    // Animation variables
    let pulseSize = 0
    let increasing = true
    let activeNodeIndex = -1
    let activeTime = 0

    // Animation function
    const animate = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Update pulse
      if (increasing) {
        pulseSize += 0.5
        if (pulseSize >= 15) increasing = false
      } else {
        pulseSize -= 0.5
        if (pulseSize <= 0) increasing = true
      }

      // Update active node
      activeTime++
      if (activeTime > 60) {
        activeTime = 0
        activeNodeIndex = (activeNodeIndex + 1) % nodes.length
      }

      // Draw connections
      nodes.forEach((node) => {
        node.connections.forEach((connId) => {
          const connectedNode = nodes.find((n) => n.id === connId)
          if (connectedNode) {
            ctx.beginPath()
            ctx.strokeStyle = `rgba(255, 255, 255, 0.2)`
            ctx.moveTo(node.x, node.y)
            ctx.lineTo(connectedNode.x, connectedNode.y)
            ctx.stroke()
          }
        })
      })

      // Draw active connection
      if (activeNodeIndex >= 0) {
        const activeNode = nodes[activeNodeIndex]
        if (activeNode.connections.length > 0) {
          const targetId = activeNode.connections[Math.floor(Math.random() * activeNode.connections.length)]
          const targetNode = nodes.find((n) => n.id === targetId)

          if (targetNode) {
            ctx.beginPath()
            ctx.strokeStyle = `rgba(255, 255, 255, 0.8)`
            ctx.lineWidth = 2
            ctx.setLineDash([5, 5])
            ctx.moveTo(activeNode.x, activeNode.y)
            ctx.lineTo(targetNode.x, targetNode.y)
            ctx.stroke()
            ctx.setLineDash([])
            ctx.lineWidth = 1
          }
        }
      }

      // Draw nodes
      nodes.forEach((node, index) => {
        const isActive = index === activeNodeIndex

        // Draw glow
        const gradient = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, node.radius * 2)
        gradient.addColorStop(0, node.color)
        gradient.addColorStop(1, "rgba(0,0,0,0)")

        ctx.beginPath()
        ctx.fillStyle = gradient
        ctx.arc(node.x, node.y, node.radius * 1.5, 0, Math.PI * 2)
        ctx.fill()

        // Draw pulse for active node
        if (isActive) {
          ctx.beginPath()
          ctx.fillStyle = `${node.color}33`
          ctx.arc(node.x, node.y, node.radius + pulseSize, 0, Math.PI * 2)
          ctx.fill()
        }

        // Draw node
        ctx.beginPath()
        ctx.fillStyle = node.color
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2)
        ctx.fill()

        // Draw border
        ctx.beginPath()
        ctx.strokeStyle = isActive ? "rgba(255, 255, 255, 0.8)" : "rgba(255, 255, 255, 0.5)"
        ctx.lineWidth = isActive ? 3 : 2
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2)
        ctx.stroke()
        ctx.lineWidth = 1

        // Draw label
        ctx.font = "12px monospace"
        ctx.fillStyle = "white"
        ctx.textAlign = "center"
        ctx.fillText(node.name, node.x, node.y + node.radius + 20)
      })

      requestAnimationFrame(animate)
    }

    // Start animation
    const animationId = requestAnimationFrame(animate)

    // Cleanup
    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="text-purple-400">Battle Network Map</CardTitle>
      </CardHeader>
      <CardContent>
        <canvas ref={canvasRef} width={600} height={300} className="w-full h-auto bg-black rounded-lg" />
      </CardContent>
    </Card>
  )
}
