"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import {
  PersistentStorage,
  type ApiSettings,
  type GeneralSettings,
  type SniperSettings,
} from "@/lib/persistent-storage"
import { SettingsDebug } from "@/components/settings-debug"
import { Check, Save } from "lucide-react"

export default function SettingsPage() {
  const [generalSettings, setGeneralSettings] = useState<GeneralSettings>(PersistentStorage.getGeneralSettings())
  const [sniperSettings, setSniperSettings] = useState<SniperSettings>(PersistentStorage.getSniperSettings())
  const [apiSettings, setApiSettings] = useState<ApiSettings>(PersistentStorage.getApiSettings())
  const [isSaving, setIsSaving] = useState(false)

  const { success, toast } = useToast()

  // Add useEffect to load settings on mount
  useEffect(() => {
    setGeneralSettings(PersistentStorage.getGeneralSettings())
    setSniperSettings(PersistentStorage.getSniperSettings())
    setApiSettings(PersistentStorage.getApiSettings())
  }, [])

  const handleGeneralChange = (key: keyof GeneralSettings, value: any) => {
    setGeneralSettings({
      ...generalSettings,
      [key]: value,
    })
  }

  const handleSniperChange = (key: keyof SniperSettings, value: any) => {
    setSniperSettings({
      ...sniperSettings,
      [key]: value,
    })
  }

  const handleApiChange = (key: keyof ApiSettings, value: string) => {
    setApiSettings({
      ...apiSettings,
      [key]: value,
    })
  }

  const handleSaveSettings = async () => {
    setIsSaving(true)

    try {
      // Save all settings to persistent storage
      PersistentStorage.saveGeneralSettings(generalSettings)
      PersistentStorage.saveSniperSettings(sniperSettings)
      PersistentStorage.saveApiSettings(apiSettings)

      // Apply the API settings to the environment variables
      if (typeof window !== "undefined") {
        // This is a client-side only operation
        ;(window as any).ETHEREUM_RPC = apiSettings.ethereumRpc
        ;(window as any).SOLANA_RPC = apiSettings.solanaRpc
        ;(window as any).BSC_RPC = apiSettings.bscRpc
      }

      // Show success message with more details
      success({
        title: "Settings Saved Successfully",
        description: `Your settings have been updated at ${new Date().toLocaleTimeString()}`,
      })

      // Add visual confirmation by briefly changing the button text
      setIsSaving(true)
      setTimeout(() => setIsSaving(false), 1500)

      console.log("Settings saved:", {
        general: generalSettings,
        sniper: sniperSettings,
        api: apiSettings,
      })
    } catch (error) {
      console.error("Error saving settings:", error)
      // Show error toast
      toast({
        title: "Error Saving Settings",
        description: "There was a problem saving your settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setTimeout(() => setIsSaving(false), 1500)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-6 space-y-6 pb-20" // Added padding at the bottom for better scrolling
    >
      <h1 className="text-3xl font-bold text-white mb-6">Settings</h1>

      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-blue-400">General Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <span>Theme</span>
              <select
                value={generalSettings.theme}
                onChange={(e) => handleGeneralChange("theme", e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white cursor-pointer"
              >
                <option value="dark">Dark</option>
                <option value="light">Light</option>
                <option value="system">System</option>
              </select>
            </div>

            <div className="flex justify-between items-center">
              <span>Notifications</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={generalSettings.notifications}
                  onChange={(e) => handleGeneralChange("notifications", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-red-400">Sniper Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <span>Auto Snipe</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={sniperSettings.autoSnipe}
                  onChange={(e) => handleSniperChange("autoSnipe", e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>

            <div className="flex justify-between items-center">
              <span>Gas Limit</span>
              <select
                value={sniperSettings.gasLimit}
                onChange={(e) => handleSniperChange("gasLimit", e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white cursor-pointer"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="flex justify-between items-center">
              <span>Slippage (%)</span>
              <input
                type="number"
                min="0.1"
                max="100"
                step="0.1"
                value={sniperSettings.slippage}
                onChange={(e) => handleSniperChange("slippage", Number.parseFloat(e.target.value))}
                className="bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white w-24 text-right"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle className="text-green-400">API Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm text-gray-400">Ethereum RPC URL</label>
              <input
                type="text"
                value={apiSettings.ethereumRpc}
                onChange={(e) => handleApiChange("ethereumRpc", e.target.value)}
                placeholder="https://eth-mainnet.alchemyapi.io/v2/your-api-key"
                className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm text-gray-400">Solana RPC URL</label>
              <input
                type="text"
                value={apiSettings.solanaRpc}
                onChange={(e) => handleApiChange("solanaRpc", e.target.value)}
                placeholder="https://api.mainnet-beta.solana.com"
                className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm text-gray-400">BSC RPC URL</label>
              <input
                type="text"
                value={apiSettings.bscRpc}
                onChange={(e) => handleApiChange("bscRpc", e.target.value)}
                placeholder="https://bsc-dataseed.binance.org/"
                className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <button
          onClick={handleSaveSettings}
          disabled={isSaving}
          className={`py-2 px-6 rounded-md transition-all duration-300 flex items-center ${
            isSaving ? "bg-green-600 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"
          }`}
        >
          {isSaving ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Saved!
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </>
          )}
        </button>
      </div>
      {/* Add the debug component */}
      <SettingsDebug />
    </motion.div>
  )
}
