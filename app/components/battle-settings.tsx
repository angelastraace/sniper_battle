"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Shield, Zap, Check, Settings, Save } from "lucide-react"
import { updateSniperSettings, getSniperStatus, type ChainSettings } from "../utils/sniper-client"
import { useToast } from "@/hooks/use-toast"

export default function BattleSettings() {
  const [settings, setSettings] = useState<{
    solana: ChainSettings
    ethereum: ChainSettings
    bsc: ChainSettings
  }>({
    solana: {
      buyAmount: 0.2,
      slippage: 3,
      verifiedOnly: true,
      antiHoneypot: true,
    },
    ethereum: {
      buyAmount: 0.1,
      slippage: 3,
      verifiedOnly: true,
      antiHoneypot: true,
      gasMultiplier: 1.5,
    },
    bsc: {
      buyAmount: 0.5,
      slippage: 5,
      verifiedOnly: true,
      antiHoneypot: true,
      gasMultiplier: 1.2,
    },
  })

  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("solana")
  const { toast } = useToast()

  // Load settings on component mount
  useEffect(() => {
    loadSettings()
  }, [])

  // Load settings from API
  const loadSettings = async () => {
    try {
      const status = await getSniperStatus()
      if (status && status.settings) {
        setSettings(status.settings)
      }
    } catch (error) {
      console.error("Error loading settings:", error)
    }
  }

  // Update settings for a specific chain
  const updateSettings = (chain: "solana" | "ethereum" | "bsc", key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [chain]: {
        ...prev[chain],
        [key]: value,
      },
    }))
  }

  // Save settings for the active chain
  const saveSettings = async () => {
    setLoading(true)
    try {
      const chain = activeTab as "solana" | "ethereum" | "bsc"
      const result = await updateSniperSettings(chain, settings[chain])

      if (result.success) {
        toast({
          title: "Settings Saved",
          description: `Battle settings for ${chain.toUpperCase()} have been updated.`,
          variant: "default",
        })
      } else {
        throw new Error("Failed to save settings")
      }
    } catch (error) {
      console.error("Error saving settings:", error)
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Settings className="mr-2 h-5 w-5" />
          Battle Settings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="solana" onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="solana">Solana</TabsTrigger>
            <TabsTrigger value="ethereum">Ethereum</TabsTrigger>
            <TabsTrigger value="bsc">BSC</TabsTrigger>
          </TabsList>

          {/* Solana Settings */}
          <TabsContent value="solana" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="solBuyAmount">
                  <Zap className="h-4 w-4 inline mr-1" /> Buy Amount (SOL)
                </Label>
                <Input
                  id="solBuyAmount"
                  type="number"
                  step="0.01"
                  value={settings.solana.buyAmount}
                  onChange={(e) => updateSettings("solana", "buyAmount", Number(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">Amount of SOL to spend on each token purchase</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="solSlippage">
                  <Zap className="h-4 w-4 inline mr-1" /> Slippage Tolerance (%)
                </Label>
                <Input
                  id="solSlippage"
                  type="number"
                  step="0.1"
                  value={settings.solana.slippage}
                  onChange={(e) => updateSettings("solana", "slippage", Number(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">Maximum acceptable price impact for swaps</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="solVerifiedOnly"
                  checked={settings.solana.verifiedOnly}
                  onCheckedChange={(checked) => updateSettings("solana", "verifiedOnly", !!checked)}
                />
                <Label htmlFor="solVerifiedOnly" className="flex items-center">
                  <Check className="h-4 w-4 mr-1 text-green-500" /> Only target verified creators
                </Label>
              </div>
              <p className="text-xs text-muted-foreground pl-6">
                Only buy tokens from creators with verified identities
              </p>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="solAntiHoneypot"
                  checked={settings.solana.antiHoneypot}
                  onCheckedChange={(checked) => updateSettings("solana", "antiHoneypot", !!checked)}
                />
                <Label htmlFor="solAntiHoneypot" className="flex items-center">
                  <Shield className="h-4 w-4 mr-1 text-blue-500" /> Anti-Honeypot Protection
                </Label>
              </div>
              <p className="text-xs text-muted-foreground pl-6">Automatically detect and avoid potential scam tokens</p>
            </div>
          </TabsContent>

          {/* Ethereum Settings */}
          <TabsContent value="ethereum" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ethBuyAmount">
                  <Zap className="h-4 w-4 inline mr-1" /> Buy Amount (ETH)
                </Label>
                <Input
                  id="ethBuyAmount"
                  type="number"
                  step="0.01"
                  value={settings.ethereum.buyAmount}
                  onChange={(e) => updateSettings("ethereum", "buyAmount", Number(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">Amount of ETH to spend on each token purchase</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ethSlippage">
                  <Zap className="h-4 w-4 inline mr-1" /> Slippage Tolerance (%)
                </Label>
                <Input
                  id="ethSlippage"
                  type="number"
                  step="0.1"
                  value={settings.ethereum.slippage}
                  onChange={(e) => updateSettings("ethereum", "slippage", Number(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">Maximum acceptable price impact for swaps</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ethGasMultiplier">
                <Zap className="h-4 w-4 inline mr-1" /> Gas Price Multiplier
              </Label>
              <div className="flex items-center space-x-4">
                <Slider
                  id="ethGasMultiplier"
                  min={1}
                  max={3}
                  step={0.1}
                  value={[settings.ethereum.gasMultiplier || 1.5]}
                  onValueChange={(value) => updateSettings("ethereum", "gasMultiplier", value[0])}
                  className="flex-1"
                />
                <span className="w-12 text-center">{settings.ethereum.gasMultiplier || 1.5}x</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Multiplier for gas price to ensure transactions are processed quickly
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="ethVerifiedOnly"
                  checked={settings.ethereum.verifiedOnly}
                  onCheckedChange={(checked) => updateSettings("ethereum", "verifiedOnly", !!checked)}
                />
                <Label htmlFor="ethVerifiedOnly" className="flex items-center">
                  <Check className="h-4 w-4 mr-1 text-green-500" /> Only target verified creators
                </Label>
              </div>
              <p className="text-xs text-muted-foreground pl-6">Only buy tokens from verified contracts on Etherscan</p>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="ethAntiHoneypot"
                  checked={settings.ethereum.antiHoneypot}
                  onCheckedChange={(checked) => updateSettings("ethereum", "antiHoneypot", !!checked)}
                />
                <Label htmlFor="ethAntiHoneypot" className="flex items-center">
                  <Shield className="h-4 w-4 mr-1 text-blue-500" /> Anti-Honeypot Protection
                </Label>
              </div>
              <p className="text-xs text-muted-foreground pl-6">Automatically detect and avoid potential scam tokens</p>
            </div>
          </TabsContent>

          {/* BSC Settings */}
          <TabsContent value="bsc" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bscBuyAmount">
                  <Zap className="h-4 w-4 inline mr-1" /> Buy Amount (BNB)
                </Label>
                <Input
                  id="bscBuyAmount"
                  type="number"
                  step="0.01"
                  value={settings.bsc.buyAmount}
                  onChange={(e) => updateSettings("bsc", "buyAmount", Number(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">Amount of BNB to spend on each token purchase</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bscSlippage">
                  <Zap className="h-4 w-4 inline mr-1" /> Slippage Tolerance (%)
                </Label>
                <Input
                  id="bscSlippage"
                  type="number"
                  step="0.1"
                  value={settings.bsc.slippage}
                  onChange={(e) => updateSettings("bsc", "slippage", Number(e.target.value))}
                />
                <p className="text-xs text-muted-foreground">Maximum acceptable price impact for swaps</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bscGasMultiplier">
                <Zap className="h-4 w-4 inline mr-1" /> Gas Price Multiplier
              </Label>
              <div className="flex items-center space-x-4">
                <Slider
                  id="bscGasMultiplier"
                  min={1}
                  max={3}
                  step={0.1}
                  value={[settings.bsc.gasMultiplier || 1.2]}
                  onValueChange={(value) => updateSettings("bsc", "gasMultiplier", value[0])}
                  className="flex-1"
                />
                <span className="w-12 text-center">{settings.bsc.gasMultiplier || 1.2}x</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Multiplier for gas price to ensure transactions are processed quickly
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="bscVerifiedOnly"
                  checked={settings.bsc.verifiedOnly}
                  onCheckedChange={(checked) => updateSettings("bsc", "verifiedOnly", !!checked)}
                />
                <Label htmlFor="bscVerifiedOnly" className="flex items-center">
                  <Check className="h-4 w-4 mr-1 text-green-500" /> Only target verified creators
                </Label>
              </div>
              <p className="text-xs text-muted-foreground pl-6">Only buy tokens from verified contracts on BSCScan</p>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="bscAntiHoneypot"
                  checked={settings.bsc.antiHoneypot}
                  onCheckedChange={(checked) => updateSettings("bsc", "antiHoneypot", !!checked)}
                />
                <Label htmlFor="bscAntiHoneypot" className="flex items-center">
                  <Shield className="h-4 w-4 mr-1 text-blue-500" /> Anti-Honeypot Protection
                </Label>
              </div>
              <p className="text-xs text-muted-foreground pl-6">Automatically detect and avoid potential scam tokens</p>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex justify-end">
          <Button onClick={saveSettings} disabled={loading} className="bg-green-600 hover:bg-green-700">
            <Save className="mr-2 h-4 w-4" />
            Save {activeTab.toUpperCase()} Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
