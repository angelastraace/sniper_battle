export type ChainType = "ethereum" | "solana" | "bsc"

export interface SniperSettings {
  buyAmount: number
  slippage: number
  verifiedOnly: boolean
  antiHoneypot: boolean
  gasMultiplier: number
}

export interface ChainStatus {
  chain: ChainType
  active: boolean
  monitoring: boolean
  settings: SniperSettings
}

export interface SniperTransaction {
  id: string
  chain: ChainType
  token_address: string
  token_symbol: string | null
  amount: number | null
  price: number | null
  input_amount: number | null
  tx_id: string
  timestamp: string
  success: boolean
}

// Get transactions
export async function getTransactions(limit = 10): Promise<SniperTransaction[]> {
  // This would normally fetch from an API, but for now we'll return mock data
  return [
    {
      id: "1",
      chain: "ethereum",
      token_address: "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
      token_symbol: "UNI",
      amount: 10.5,
      price: 5.2,
      input_amount: 0.1,
      tx_id: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
      timestamp: new Date().toISOString(),
      success: true,
    },
    {
      id: "2",
      chain: "solana",
      token_address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      token_symbol: "USDC",
      amount: 100,
      price: 1.0,
      input_amount: 1.5,
      tx_id:
        "5KKsWtpBB2tHBfx1T2QfJqaWL3eLyGZttXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
      timestamp: new Date().toISOString(),
      success: true,
    },
  ]
}

// Add the missing exports
export async function updateSniperSettings(chain: ChainType, settings: Partial<SniperSettings>): Promise<boolean> {
  console.log(`Updating settings for ${chain}:`, settings)
  // In a real implementation, this would update settings in a database or API
  return true
}

export async function getSniperStatus(): Promise<{
  active: boolean
  chains: ChainStatus[]
}> {
  // Mock implementation
  return {
    active: true,
    chains: [
      {
        chain: "ethereum",
        active: true,
        monitoring: true,
        settings: {
          buyAmount: 0.1,
          slippage: 2.5,
          verifiedOnly: true,
          antiHoneypot: true,
          gasMultiplier: 1.5,
        },
      },
      {
        chain: "solana",
        active: true,
        monitoring: true,
        settings: {
          buyAmount: 1.0,
          slippage: 1.0,
          verifiedOnly: false,
          antiHoneypot: true,
          gasMultiplier: 1.0,
        },
      },
      {
        chain: "bsc",
        active: false,
        monitoring: false,
        settings: {
          buyAmount: 0.5,
          slippage: 5.0,
          verifiedOnly: false,
          antiHoneypot: false,
          gasMultiplier: 2.0,
        },
      },
    ],
  }
}
