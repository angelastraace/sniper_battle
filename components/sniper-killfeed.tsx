"use client"

import { useState, useEffect } from "react"

interface SnipeEvent {
  id: string
  chain: "ethereum" | "solana"
  tokenAddress: string
  tokenName: string
  txHash: string
  timestamp: number
  profit: string
  url: string
}

const SniperKillfeed = () => {
  const [snipeEvents, setSnipeEvents] = useState<SnipeEvent[]>([])

  useEffect(() => {
    // Generate initial mock events
    const initialEvents = generateMockSnipeEvents(10)
    setSnipeEvents(initialEvents)

    // Set up interval to add new mock events
    const intervalId = setInterval(() => {
      setSnipeEvents((prevEvents) => {
        const newEvents = generateMockSnipeEvents(3)
        return [...newEvents, ...prevEvents].sort((a, b) => b.timestamp - a.timestamp).slice(0, 20) // Keep only the latest 20 events
      })
    }, 5000)

    return () => clearInterval(intervalId) // Clean up interval on unmount
  }, [])

  const timeAgo = (timestamp: number): string => {
    const now = Date.now()
    const diff = now - timestamp
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)

    if (days > 0) {
      return `${days} day${days > 1 ? "s" : ""} ago`
    } else if (hours > 0) {
      return `${hours} hour${hours > 1 ? "s" : ""} ago`
    } else if (minutes > 0) {
      return `${minutes} minute${minutes > 1 ? "s" : ""} ago`
    } else {
      return "Just now"
    }
  }

  return (
    <div className="bg-gray-900 rounded-lg shadow-md p-4">
      <h2 className="text-xl font-semibold text-white mb-4">Sniper Killfeed</h2>
      <ul>
        {snipeEvents.map((event) => (
          <li key={event.id} className="py-2 border-b border-gray-700 last:border-b-0">
            <div className="flex items-center justify-between">
              <div>
                <a href={event.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                  {event.tokenName}
                </a>
                <p className="text-gray-400 text-sm">
                  {event.chain === "ethereum" ? "ETH" : "SOL"} - {timeAgo(event.timestamp)}
                </p>
              </div>
              <div className="text-green-500 font-semibold">{event.profit}</div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

// Function to generate mock snipe events
const generateMockSnipeEvents = (count: number): SnipeEvent[] => {
  const mockEvents: SnipeEvent[] = []
  const now = Date.now()
  const chains = ["ethereum", "solana"] as const
  const tokenNames = [
    "PEPE",
    "DOGE",
    "SHIB",
    "FLOKI",
    "BONK",
    "MOON",
    "SAFE",
    "ROCKET",
    "ELON",
    "BASED",
    "APE",
    "MONKEY",
    "BANANA",
    "MEME",
    "CHAD",
  ]

  for (let i = 0; i < count; i++) {
    const chain = chains[Math.floor(Math.random() * chains.length)]
    const tokenName = tokenNames[Math.floor(Math.random() * tokenNames.length)]

    if (chain === "ethereum") {
      // Ethereum mock event
      const tokenAddress = `0x${Math.random().toString(16).substring(2, 42)}`
      const txHash = `0x${Math.random().toString(16).substring(2, 62)}`

      mockEvents.push({
        id: `eth-mock-${i}`,
        chain: "ethereum",
        tokenAddress: tokenAddress,
        tokenName: `${tokenName} Token`,
        txHash: txHash,
        timestamp: now - i * 60000 - Math.floor(Math.random() * 30000),
        profit: `+${(Math.random() * 15).toFixed(1)}%`,
        // Use the actual transaction hash in the URL
        url: `https://etherscan.io/tx/${txHash}`,
      })
    } else {
      // Solana mock event
      const signature = Array.from(
        { length: 87 },
        () => "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"[Math.floor(Math.random() * 58)],
      ).join("")

      const tokenAddress = Array.from(
        { length: 44 },
        () => "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"[Math.floor(Math.random() * 58)],
      ).join("")

      mockEvents.push({
        id: `sol-mock-${i}`,
        chain: "solana",
        tokenAddress: tokenAddress,
        tokenName: `${tokenName} Token`,
        txHash: signature,
        timestamp: now - i * 60000 - Math.floor(Math.random() * 30000),
        profit: `+${(Math.random() * 20).toFixed(1)}%`,
        // Use the actual signature in the URL
        url: `https://solscan.io/tx/${signature}`,
      })
    }
  }

  return mockEvents.sort((a, b) => b.timestamp - a.timestamp)
}

export default SniperKillfeed
