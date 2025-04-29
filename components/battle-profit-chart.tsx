"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default function BattleProfitChart() {
  const [data, setData] = useState<{ date: string; profit: number }[]>([])
  const [totalProfit, setTotalProfit] = useState(0)

  useEffect(() => {
    // In a real implementation, this would fetch actual profit data from an API
    // For now, we'll just set an empty array since we don't want mock data
    setData([])
    setTotalProfit(0)

    // This component should be connected to a real data source
    // that tracks actual profits from transactions
  }, [])

  // Find the min and max values for scaling
  const maxProfit = Math.max(...data.map((d) => d.profit), 0)
  const minProfit = Math.min(...data.map((d) => d.profit), 0)
  const range = Math.max(maxProfit - minProfit, 1)

  // Calculate the height of the chart
  const chartHeight = 200
  const chartWidth = 600

  // Calculate the width of each bar
  const barWidth = chartWidth / data.length

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-cyan-400">Profit Chart</CardTitle>
        <div className="text-xl font-bold text-cyan-300">{totalProfit.toFixed(2)} ETH</div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <div className="h-[200px] flex items-center justify-center text-gray-500">
            No profit data available. Connect to a real data source.
          </div>
        ) : (
          <div className="relative h-[200px] w-full">
            {/* Y-axis labels */}
            <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500">
              <div>{maxProfit.toFixed(2)}</div>
              <div>0</div>
              <div>{minProfit.toFixed(2)}</div>
            </div>

            {/* Chart */}
            <div className="absolute left-8 right-0 h-full">
              {/* Zero line */}
              <div
                className="absolute left-0 right-0 border-t border-gray-700"
                style={{
                  top: `${chartHeight * (maxProfit / range)}px`,
                }}
              ></div>

              {/* Bars */}
              <div className="flex h-full items-end">
                {data.map((d, i) => {
                  const barHeight = (Math.abs(d.profit) / range) * chartHeight
                  const isPositive = d.profit >= 0

                  return (
                    <div key={i} className="relative flex-1" style={{ height: "100%" }}>
                      <div
                        className={`absolute bottom-0 w-[80%] mx-auto left-0 right-0 ${
                          isPositive ? "bg-green-500" : "bg-red-500"
                        }`}
                        style={{
                          height: `${barHeight}px`,
                          bottom: isPositive ? `${chartHeight * (maxProfit / range)}px` : "auto",
                          top: isPositive ? "auto" : `${chartHeight * (maxProfit / range)}px`,
                        }}
                      ></div>

                      {/* X-axis labels (show every 5th day) */}
                      {i % 5 === 0 && (
                        <div className="absolute bottom-[-20px] text-xs text-gray-500 w-full text-center">
                          {d.date.split("-")[2]}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
