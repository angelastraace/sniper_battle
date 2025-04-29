// Simple storage service for wallet information
export interface WalletInfo {
  address: string
  privateKey: string
}

export interface WalletStorage {
  ethereum: WalletInfo
  solana: WalletInfo
  bsc: WalletInfo
}

// Use localStorage to persist wallet information
export const walletStorage = {
  saveWallet: (chain: "ethereum" | "solana" | "bsc", address: string, privateKey: string): void => {
    try {
      if (typeof window === "undefined") return

      // Get existing wallets
      const existingData = localStorage.getItem("wallets")
      const wallets: WalletStorage = existingData
        ? JSON.parse(existingData)
        : {
            ethereum: { address: "", privateKey: "" },
            solana: { address: "", privateKey: "" },
            bsc: { address: "", privateKey: "" },
          }

      // Update the specified chain
      wallets[chain] = { address, privateKey }

      // Save back to localStorage
      localStorage.setItem("wallets", JSON.stringify(wallets))
    } catch (error) {
      console.error("Error saving wallet:", error)
    }
  },

  getWallets: (): WalletStorage => {
    try {
      if (typeof window === "undefined") {
        return {
          ethereum: { address: "", privateKey: "" },
          solana: { address: "", privateKey: "" },
          bsc: { address: "", privateKey: "" },
        }
      }

      const data = localStorage.getItem("wallets")
      if (data) {
        return JSON.parse(data)
      }
    } catch (error) {
      console.error("Error getting wallets:", error)
    }

    // Return default empty wallets if nothing found or error
    return {
      ethereum: { address: "", privateKey: "" },
      solana: { address: "", privateKey: "" },
      bsc: { address: "", privateKey: "" },
    }
  },

  getWallet: (chain: "ethereum" | "solana" | "bsc"): WalletInfo => {
    const wallets = walletStorage.getWallets()
    return wallets[chain]
  },
}
