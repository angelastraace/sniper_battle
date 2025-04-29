export interface WalletResult {
  publicKey: string
  phrase: string
  balance: number
  swept: boolean
  explorerLink?: string
  error?: string
  timestamp: number
}

export interface ScannerOptions {
  destination?: string
  autoSweep?: boolean
  minBalance?: number
  maxThreads?: number
}

// This is just a type definition file, the actual implementation would be more complex
