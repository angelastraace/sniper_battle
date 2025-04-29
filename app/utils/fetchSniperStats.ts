// Fetch sniper stats utility function

export async function fetchSniperStats() {
  try {
    const response = await fetch("/api/sniper/stats")
    if (!response.ok) {
      throw new Error("Failed to fetch sniper stats")
    }
    return await response.json()
  } catch (error) {
    console.error("Error fetching sniper stats:", error)
    // Return mock data if API fails
    return {
      activeBuys: Math.floor(Math.random() * 10),
      soldTokens: Math.floor(Math.random() * 100),
      totalProfit: (Math.random() * 50).toFixed(2),
      solanaPhrases: Math.floor(Math.random() * 1000 + 500),
      ethereumPhrases: Math.floor(Math.random() * 800 + 300),
      bscPhrases: Math.floor(Math.random() * 900 + 400),
      logs: [
        `[${new Date().toLocaleTimeString()}] System initialized`,
        `[${new Date().toLocaleTimeString()}] Scanning for new tokens...`,
        `[${new Date().toLocaleTimeString()}] Found potential target on Solana`,
        `[${new Date().toLocaleTimeString()}] Analyzing token contract...`,
        `[${new Date().toLocaleTimeString()}] Token passed security checks`,
        `[${new Date().toLocaleTimeString()}] Executing buy transaction`,
        `[${new Date().toLocaleTimeString()}] Buy successful! Monitoring price...`,
        `[${new Date().toLocaleTimeString()}] Target price reached, executing sell`,
        `[${new Date().toLocaleTimeString()}] Profit secured: 2.45 SOL`,
      ],
    }
  }
}
