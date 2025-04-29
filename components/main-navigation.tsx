"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import {
  Home,
  BarChart2,
  Radar,
  Crosshair,
  Database,
  Settings,
  Menu,
  X,
  Terminal,
  LineChart,
  Wallet,
  Globe,
} from "lucide-react"

export default function MainNavigation() {
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const routes = [
    {
      name: "Home",
      path: "/",
      icon: Home,
    },
    {
      name: "Dashboard",
      path: "/battle-dashboard",
      icon: BarChart2,
    },
    {
      name: "Command Center",
      path: "/battle-dashboard/command-center",
      icon: Terminal,
    },
    {
      name: "Radar System",
      path: "/battle-dashboard/radar",
      icon: Radar,
    },
    {
      name: "Sniper Control",
      path: "/battle-dashboard/sniper",
      icon: Crosshair,
    },
    {
      name: "Analytics",
      path: "/battle-dashboard/analytics",
      icon: LineChart,
    },
    {
      name: "Wallet",
      path: "/battle-dashboard/wallet",
      icon: Wallet,
    },
    {
      name: "Blockchain Status",
      path: "/battle-dashboard/blockchain",
      icon: Database,
    },
    {
      name: "Blockchain Explorer",
      path: "/blockchain-explorer",
      icon: Globe,
    },
    {
      name: "Settings",
      path: "/battle-dashboard/settings",
      icon: Settings,
    },
  ]

  const isActive = (path: string) => {
    if (path === "/") {
      return pathname === "/"
    }
    return pathname?.startsWith(path)
  }

  return (
    <>
      {/* Desktop Navigation */}
      <div className="hidden md:block">
        <nav className="fixed left-0 top-0 z-40 h-screen w-64 bg-gray-900 border-r border-gray-800 p-4 flex flex-col overflow-hidden">
          <div className="flex items-center gap-2 mb-8">
            <span className="text-2xl">🧠</span>
            <h1 className="text-xl font-bold text-white">Ace Sniper</h1>
          </div>

          <div className="space-y-1 flex-1 overflow-y-auto">
            {routes.map((route) => (
              <Link
                key={route.path}
                href={route.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                  isActive(route.path)
                    ? "bg-blue-900/50 text-blue-400"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <route.icon size={18} />
                <span>{route.name}</span>
                {isActive(route.path) && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute right-0 w-1 h-8 bg-blue-500 rounded-l-md"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </Link>
            ))}
          </div>

          <div className="mt-auto">
            <div className="bg-gray-800 rounded-md p-3 text-xs text-gray-400">
              <div className="flex items-center justify-between mb-2">
                <span>System Status</span>
                <span className="text-green-400">Online</span>
              </div>
              <div className="w-full bg-gray-700 h-1 rounded-full overflow-hidden">
                <div className="bg-green-500 h-1 rounded-full w-[92%]"></div>
              </div>
            </div>
          </div>
        </nav>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="fixed top-4 right-4 z-50 p-2 bg-gray-800 rounded-md text-white"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {mobileMenuOpen && (
          <motion.nav
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-gray-900 p-4"
          >
            <div className="flex items-center gap-2 mb-8 mt-4">
              <span className="text-2xl">🧠</span>
              <h1 className="text-xl font-bold text-white">Ace Sniper</h1>
            </div>

            <div className="space-y-2">
              {routes.map((route) => (
                <Link
                  key={route.path}
                  href={route.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-3 rounded-md transition-colors ${
                    isActive(route.path)
                      ? "bg-blue-900/50 text-blue-400"
                      : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <route.icon size={20} />
                  <span>{route.name}</span>
                </Link>
              ))}
            </div>
          </motion.nav>
        )}
      </div>
    </>
  )
}
