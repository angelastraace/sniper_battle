"use client"

import { useEffect, useState } from "react"

export default function WalletStats() {
  const [walletCount, setWalletCount] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setWalletCount((prev) => prev + Math.floor(Math.random() * 5)) // fake stats for demo
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-gray-900 p-6 rounded-xl shadow-lg text-white">
      <h2 className="text-2xl font-bold mb-4 text-center">🪙 Wallet Stats</h2>
      <p className="text-center text-green-400 text-xl">Wallets Scanned: {walletCount}</p>
    </div>
  )
}
