"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const enemyColors = ["#ff4d4f", "#ff7a45", "#ffa940", "#ffc53d", "#bae637"]

interface Enemy {
  id: number
  name: string
  distance: number
  angle: number
}

export default function RadarEnemyCanvas() {
  const [enemies, setEnemies] = useState<Enemy[]>([])

  useEffect(() => {
    const interval = setInterval(() => {
      setEnemies((prev) => [
        ...prev.slice(-9),
        {
          id: Date.now(),
          name: `Enemy-${Math.floor(Math.random() * 1000)}`,
          distance: Math.random() * 100,
          angle: Math.random() * 360,
        },
      ])
    }, 2500)

    return () => clearInterval(interval)
  }, [])

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="text-pink-400">Radar: Enemies Detected</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative h-96 w-full rounded-full border-2 border-pink-400">
          {enemies.map((enemy, index) => (
            <motion.div
              key={enemy.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              style={{
                position: "absolute",
                top: `calc(50% + ${enemy.distance * Math.sin((enemy.angle * Math.PI) / 180)}px)`,
                left: `calc(50% + ${enemy.distance * Math.cos((enemy.angle * Math.PI) / 180)}px)`,
                transform: "translate(-50%, -50%)",
                backgroundColor: enemyColors[index % enemyColors.length],
                width: "16px",
                height: "16px",
                borderRadius: "50%",
              }}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
