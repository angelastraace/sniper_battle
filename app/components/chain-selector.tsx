"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LinkIcon, Layers, Zap } from "lucide-react"

interface ChainInfo {
  id: string
  name: string
  icon: React.ReactNode
  color: string
  active: boolean
}

interface ChainSelectorProps {
  onChainSelect: (chainId: string) => void
  selectedChain?: string
}

export default function ChainSelector({ onChainSelect, selectedChain = "ethereum" }: ChainSelectorProps) {
  const [chains] = useState<ChainInfo[]>([
    {
      id: "ethereum",
      name: "Ethereum",
      icon: <Layers className="h-4 w-4" />,
      color: "bg-blue-500",
      active: true,
    },
    {
      id: "bsc",
      name: "BSC",
      icon: <Zap className="h-4 w-4" />,
      color: "bg-yellow-500",
      active: true,
    },
    {
      id: "solana",
      name: "Solana",
      icon: <LinkIcon className="h-4 w-4" />,
      color: "bg-purple-500",
      active: true,
    },
    {
      id: "arbitrum",
      name: "Arbitrum",
      icon: <Layers className="h-4 w-4" />,
      color: "bg-blue-700",
      active: true,
    },
    {
      id: "polygon",
      name: "Polygon",
      icon: <Layers className="h-4 w-4" />,
      color: "bg-purple-700",
      active: true,
    },
  ])

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Select Blockchain</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          {chains.map((chain) => (
            <Button
              key={chain.id}
              variant={selectedChain === chain.id ? "default" : "outline"}
              size="sm"
              className="justify-start"
              onClick={() => onChainSelect(chain.id)}
              disabled={!chain.active}
            >
              <div className={`w-2 h-2 rounded-full mr-2 ${chain.color}`} />
              <span className="mr-1">{chain.name}</span>
              {!chain.active && (
                <Badge variant="outline" className="ml-auto text-xs">
                  Soon
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
