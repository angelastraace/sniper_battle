"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"

interface BattleStatsProps {
  title: string
  initialValue: number
  suffix?: string
  prefix?: string
  color: string
  increment?: boolean
}

export default function BattleStatsCard({
  title,
  initialValue,
  suffix = "",
  prefix = "",
  color,
  increment = true,
}: BattleStatsProps) {
  const [value, setValue] = useState(initialValue)

  useEffect(() => {
    // We'll keep the initial value static since this should be real data
    // No random increments or simulations
    setValue(initialValue)
  }, [initialValue])

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader className="pb-2">
        <CardTitle className={`text-sm text-${color}-400`}>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <motion.div
          key={value.toFixed(2)}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`text-2xl font-bold text-${color}-300 font-mono`}
        >
          {prefix}
          {value.toFixed(2)}
          {suffix}
        </motion.div>
      </CardContent>
    </Card>
  )
}
