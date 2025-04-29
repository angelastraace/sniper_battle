"use client"

export interface ApiSettings {
  ethereumRpc?: string
  solanaRpc?: string
  bscRpc?: string
}

export interface GeneralSettings {
  theme?: "light" | "dark" | "system"
  notifications?: boolean
}

export interface SniperSettings {
  autoSnipe?: boolean
  gasLimit?: string
  slippage?: number
}

export interface ProfitData {
  ethereum: number
  solana: number
  bsc: number
  lastUpdated?: number
}

export class PersistentStorage {
  private static readonly API_SETTINGS_KEY = "ace-sniper-api-settings"
  private static readonly GENERAL_SETTINGS_KEY = "ace-sniper-general-settings"
  private static readonly SNIPER_SETTINGS_KEY = "ace-sniper-sniper-settings"
  private static readonly ETHEREUM_PRIVATE_KEY = "ace-sniper-eth-private-key"
  private static readonly SOLANA_PRIVATE_KEY = "ace-sniper-sol-private-key"
  private static readonly BSC_PRIVATE_KEY = "ace-sniper-bsc-private-key"
  private static readonly PROFIT_DATA_KEY = "ace-sniper-profit-data"

  public static getApiSettings(): ApiSettings {
    if (typeof window === "undefined") return {}

    try {
      const settings = localStorage.getItem(this.API_SETTINGS_KEY)
      return settings ? JSON.parse(settings) : {}
    } catch (error) {
      console.error("Error getting API settings:", error)
      return {}
    }
  }

  public static saveApiSettings(settings: ApiSettings): void {
    if (typeof window === "undefined") return

    try {
      localStorage.setItem(this.API_SETTINGS_KEY, JSON.stringify(settings))
    } catch (error) {
      console.error("Error setting API settings:", error)
    }
  }

  public static getGeneralSettings(): GeneralSettings {
    if (typeof window === "undefined") return {}

    try {
      const settings = localStorage.getItem(this.GENERAL_SETTINGS_KEY)
      return settings ? JSON.parse(settings) : { theme: "dark", notifications: true }
    } catch (error) {
      console.error("Error getting general settings:", error)
      return { theme: "dark", notifications: true }
    }
  }

  public static saveGeneralSettings(settings: GeneralSettings): void {
    if (typeof window === "undefined") return

    try {
      localStorage.setItem(this.GENERAL_SETTINGS_KEY, JSON.stringify(settings))
    } catch (error) {
      console.error("Error setting general settings:", error)
    }
  }

  public static getSniperSettings(): SniperSettings {
    if (typeof window === "undefined") return {}

    try {
      const settings = localStorage.getItem(this.SNIPER_SETTINGS_KEY)
      return settings ? JSON.parse(settings) : { autoSnipe: false, gasLimit: "medium", slippage: 1.0 }
    } catch (error) {
      console.error("Error getting sniper settings:", error)
      return { autoSnipe: false, gasLimit: "medium", slippage: 1.0 }
    }
  }

  public static saveSniperSettings(settings: SniperSettings): void {
    if (typeof window === "undefined") return

    try {
      localStorage.setItem(this.SNIPER_SETTINGS_KEY, JSON.stringify(settings))
    } catch (error) {
      console.error("Error setting sniper settings:", error)
    }
  }

  public static getEthereumPrivateKey(): string | null {
    if (typeof window === "undefined") return null

    try {
      return localStorage.getItem(this.ETHEREUM_PRIVATE_KEY)
    } catch (error) {
      console.error("Error getting Ethereum private key:", error)
      return null
    }
  }

  public static setEthereumPrivateKey(key: string): void {
    if (typeof window === "undefined") return

    try {
      localStorage.setItem(this.ETHEREUM_PRIVATE_KEY, key)
    } catch (error) {
      console.error("Error setting Ethereum private key:", error)
    }
  }

  public static getSolanaPrivateKey(): string | null {
    if (typeof window === "undefined") return null

    try {
      return localStorage.getItem(this.SOLANA_PRIVATE_KEY)
    } catch (error) {
      console.error("Error getting Solana private key:", error)
      return null
    }
  }

  public static setSolanaPrivateKey(key: string): void {
    if (typeof window === "undefined") return

    try {
      localStorage.setItem(this.SOLANA_PRIVATE_KEY, key)
    } catch (error) {
      console.error("Error setting Solana private key:", error)
    }
  }

  public static getBscPrivateKey(): string | null {
    if (typeof window === "undefined") return null

    try {
      return localStorage.getItem(this.BSC_PRIVATE_KEY)
    } catch (error) {
      console.error("Error getting BSC private key:", error)
      return null
    }
  }

  public static setBscPrivateKey(key: string): void {
    if (typeof window === "undefined") return

    try {
      localStorage.setItem(this.BSC_PRIVATE_KEY, key)
    } catch (error) {
      console.error("Error setting BSC private key:", error)
    }
  }

  public static getProfitData(): ProfitData {
    if (typeof window === "undefined") return { ethereum: 0, solana: 0, bsc: 0 }

    try {
      const data = localStorage.getItem(this.PROFIT_DATA_KEY)
      return data ? JSON.parse(data) : { ethereum: 0, solana: 0, bsc: 0 }
    } catch (error) {
      console.error("Error getting profit data:", error)
      return { ethereum: 0, solana: 0, bsc: 0 }
    }
  }

  public static saveProfitData(data: ProfitData): void {
    if (typeof window === "undefined") return

    try {
      localStorage.setItem(this.PROFIT_DATA_KEY, JSON.stringify(data))
    } catch (error) {
      console.error("Error saving profit data:", error)
    }
  }

  public static clearAllData(): void {
    if (typeof window === "undefined") return

    try {
      localStorage.removeItem(this.API_SETTINGS_KEY)
      localStorage.removeItem(this.GENERAL_SETTINGS_KEY)
      localStorage.removeItem(this.SNIPER_SETTINGS_KEY)
      localStorage.removeItem(this.ETHEREUM_PRIVATE_KEY)
      localStorage.removeItem(this.SOLANA_PRIVATE_KEY)
      localStorage.removeItem(this.BSC_PRIVATE_KEY)
      localStorage.removeItem(this.PROFIT_DATA_KEY)
    } catch (error) {
      console.error("Error clearing all data:", error)
    }
  }
}
