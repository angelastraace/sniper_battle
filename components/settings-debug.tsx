"use client"

import { useEffect, useState } from "react"
import { PersistentStorage } from "@/lib/persistent-storage"

export function SettingsDebug() {
  const [apiSettings, setApiSettings] = useState<any>({})
  const [generalSettings, setGeneralSettings] = useState<any>({})
  const [sniperSettings, setSniperSettings] = useState<any>({})
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check if we're in development mode
    if (process.env.NODE_ENV === "development") {
      setIsVisible(true)
      const settings = PersistentStorage.getApiSettings()
      setApiSettings(settings)
    }
  }, [])

  useEffect(() => {
    // Load settings
    if (typeof window !== "undefined") {
      try {
        const apiSettingsStr = localStorage.getItem("ace-sniper:api-settings")
        const generalSettingsStr = localStorage.getItem("ace-sniper:general-settings")
        const sniperSettingsStr = localStorage.getItem("ace-sniper:sniper-settings")

        setApiSettings(apiSettingsStr ? JSON.parse(apiSettingsStr) : {})
        setGeneralSettings(generalSettingsStr ? JSON.parse(generalSettingsStr) : {})
        setSniperSettings(sniperSettingsStr ? JSON.parse(sniperSettingsStr) : {})
      } catch (e) {
        console.error("Error loading settings for debug:", e)
      }
    }
  }, [])

  const refreshSettings = () => {
    const settings = PersistentStorage.getApiSettings()
    setApiSettings(settings)
    console.log("Current API settings:", settings)
  }

  const clearSettings = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("ace-sniper:api-settings")
      refreshSettings()
    }
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 p-4 rounded-lg border border-gray-700 z-50 max-w-md text-xs">
      <h3 className="text-sm font-bold mb-2 text-blue-400">Settings Debug</h3>
      <pre className="text-gray-300 overflow-auto max-h-40">{JSON.stringify(apiSettings, null, 2)}</pre>
      <div className="flex gap-2 mt-2">
        <button
          onClick={refreshSettings}
          className="bg-blue-600 hover:bg-blue-700 text-white py-1 px-2 rounded-md text-xs"
        >
          Refresh
        </button>
        <button onClick={clearSettings} className="bg-red-600 hover:bg-red-700 text-white py-1 px-2 rounded-md text-xs">
          Clear
        </button>
      </div>
      <div className="mt-4 p-4 border border-gray-700 rounded-md bg-gray-800">
        <h3 className="text-sm font-medium text-gray-400 mb-2">Last Saved Timestamps</h3>
        <div className="grid grid-cols-1 gap-2 text-xs">
          <div className="flex justify-between">
            <span>API Settings:</span>
            <span>{new Date(apiSettings.lastUpdated || Date.now()).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>General Settings:</span>
            <span>{new Date(generalSettings.lastUpdated || Date.now()).toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Sniper Settings:</span>
            <span>{new Date(sniperSettings.lastUpdated || Date.now()).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
