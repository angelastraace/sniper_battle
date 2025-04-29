"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Activity, Database, Search } from "lucide-react"

interface NavBarProps {
  activePage?: string
}

export default function NavBar({ activePage }: NavBarProps) {
  const pathname = usePathname()

  const isActive = (page: string) => {
    if (activePage) {
      return activePage === page
    }

    if (page === "home") return pathname === "/"
    return pathname?.includes(page)
  }

  return (
    <div className="flex items-center justify-between mb-6 border-b border-gray-200 pb-4">
      <div className="flex items-center space-x-4">
        <Link
          href="/"
          className={`flex items-center space-x-2 px-3 py-2 rounded-md ${isActive("home") ? "bg-blue-100 text-blue-800" : "hover:bg-gray-100"}`}
        >
          <Home size={18} />
          <span>Home</span>
        </Link>

        <Link
          href="/transactions"
          className={`flex items-center space-x-2 px-3 py-2 rounded-md ${isActive("tx") ? "bg-blue-100 text-blue-800" : "hover:bg-gray-100"}`}
        >
          <Activity size={18} />
          <span>Transactions</span>
        </Link>

        <Link
          href="/blockchain-explorer"
          className={`flex items-center space-x-2 px-3 py-2 rounded-md ${isActive("explorer") ? "bg-blue-100 text-blue-800" : "hover:bg-gray-100"}`}
        >
          <Database size={18} />
          <span>Explorer</span>
        </Link>

        <Link
          href="/validation"
          className={`flex items-center space-x-2 px-3 py-2 rounded-md ${isActive("validation") ? "bg-blue-100 text-blue-800" : "hover:bg-gray-100"}`}
        >
          <Search size={18} />
          <span>Validation</span>
        </Link>
      </div>
    </div>
  )
}
