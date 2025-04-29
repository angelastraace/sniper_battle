"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import type { ChainType, SniperSettings } from "@/app/utils/sniper-client"
import { Loader2, AlertTriangle, Shield, Check } from "lucide-react"
import Image from "next/image"

interface ChainCardProps {
  chain: ChainType
  active: boolean
  monitoring: boolean
  settings: SniperSettings
  onToggle: (chain: ChainType, active: boolean) => Promise<void>
  onSettingsChange: (chain: ChainType, settings: Partial<SniperSettings>) => Promise<void>
  onManualSnipe: (chain: ChainType, tokenAddress: string) => Promise<void>
}

export function ChainCard({
  chain,
  active,
  monitoring,
  settings,
  onToggle,
  onSettingsChange,
  onManualSnipe,
}: ChainCardProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const [buyAmount, setBuyAmount] = useState(settings.buyAmount.toString())
  const [slippage, setSlippage] = useState(settings.slippage)
  const [verifiedOnly, setVerifiedOnly] = useState(settings.verifiedOnly)
  const [antiHoneypot, setAntiHoneypot] = useState(settings.antiHoneypot)
  const [gasMultiplier, setGasMultiplier] = useState(settings.gasMultiplier)
  const [tokenAddress, setTokenAddress] = useState("")
  const [isSnipeLoading, setIsSnipeLoading] = useState(false)

  const getChainLogo = () => {
    switch (chain) {
      case "solana":
        return "/solana-logo.png"
      case "ethereum":
        return "/ethereum-logo.png"
      case "bsc":
        return "/binance-logo.png"
      default:
        return ""
    }
  }

  const getChainCurrency = () => {
    switch (chain) {
      case "solana":
        return "SOL"
      case "ethereum":
        return "ETH"
      case "bsc":
        return "BNB"
      default:
        return ""
    }
  }

  const handleToggle = async () => {
    await onToggle(chain, !active)
  }

  const handleSaveSettings = async () => {
    setIsUpdating(true)
    try {
      const newSettings: Partial<SniperSettings> = {
        buyAmount: Number.parseFloat(buyAmount),
        slippage,
        verifiedOnly,
        antiHoneypot,
        gasMultiplier,
      }
      await onSettingsChange(chain, newSettings)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleManualSnipe = async () => {
    if (!tokenAddress.trim()) return

    setIsSnipeLoading(true)
    try {
      await onManualSnipe(chain, tokenAddress.trim())
    } finally {
      setIsSnipeLoading(false)
    }
  }

  return (
    <Card className={`w-full ${active ? "border-green-500" : "border-gray-200"}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 relative">
            <Image
              src={getChainLogo() || "/placeholder.svg?height=32&width=32&query=blockchain"}
              alt={`${chain} logo`}
              fill
              className="object-contain"
            />
          </div>
          <div>
            <CardTitle className="text-xl capitalize">{chain}</CardTitle>
            <CardDescription>
              {active ? (
                <span className="text-green-500 flex items-center">
                  <Check size={16} className="mr-1" /> Active
                </span>
              ) : (
                <span className="text-gray-500">Inactive</span>
              )}
            </CardDescription>
          </div>
        </div>
        <Switch checked={active} onCheckedChange={handleToggle} />
      </CardHeader>
      <CardContent className="pt-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor={`${chain}-buy-amount`}>Buy Amount ({getChainCurrency()})</Label>
              <span className="text-sm text-gray-500">
                {buyAmount} {getChainCurrency()}
              </span>
            </div>
            <Input
              id={`${chain}-buy-amount`}
              type="number"
              value={buyAmount}
              onChange={(e) => setBuyAmount(e.target.value)}
              step="0.01"
              min="0.01"
              disabled={!active}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor={`${chain}-slippage`}>Slippage Tolerance</Label>
              <span className="text-sm text-gray-500">{slippage}%</span>
            </div>
            <Slider
              id={`${chain}-slippage`}
              value={[slippage]}
              onValueChange={(value) => setSlippage(value[0])}
              min={0.1}
              max={20}
              step={0.1}
              disabled={!active}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor={`${chain}-gas-multiplier`}>Gas Price Multiplier</Label>
              <span className="text-sm text-gray-500">{gasMultiplier}x</span>
            </div>
            <Slider
              id={`${chain}-gas-multiplier`}
              value={[gasMultiplier]}
              onValueChange={(value) => setGasMultiplier(value[0])}
              min={1}
              max={3}
              step={0.1}
              disabled={!active}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id={`${chain}-verified-only`}
              checked={verifiedOnly}
              onCheckedChange={setVerifiedOnly}
              disabled={!active}
            />
            <Label htmlFor={`${chain}-verified-only`} className="flex items-center">
              <Check size={16} className="mr-1" /> Verified Only
            </Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id={`${chain}-anti-honeypot`}
              checked={antiHoneypot}
              onCheckedChange={setAntiHoneypot}
              disabled={!active}
            />
            <Label htmlFor={`${chain}-anti-honeypot`} className="flex items-center">
              <Shield size={16} className="mr-1" /> Anti-Honeypot
            </Label>
          </div>

          <Button onClick={handleSaveSettings} disabled={isUpdating || !active} className="w-full">
            {isUpdating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Settings"
            )}
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-4">
        <div className="flex items-center space-x-2 w-full">
          <Input
            placeholder={`Enter ${chain} token address`}
            value={tokenAddress}
            onChange={(e) => setTokenAddress(e.target.value)}
            disabled={!active || isSnipeLoading}
          />
          <Button onClick={handleManualSnipe} disabled={!active || !tokenAddress.trim() || isSnipeLoading}>
            {isSnipeLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Snipe"}
          </Button>
        </div>
        {!active && (
          <div className="flex items-center text-amber-500 text-sm">
            <AlertTriangle size={16} className="mr-1" />
            Activate sniper to enable manual sniping
          </div>
        )}
      </CardFooter>
    </Card>
  )
}
