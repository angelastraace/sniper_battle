import { ethers } from "ethers"
import { Connection } from "@solana/web3.js"
import { create } from "zustand"
import { persist } from "zustand/middleware"
import { config } from "./config"

export type ConnectionStatus = "connected" | "disconnected" | "connecting" | "error"
export type NetworkType = "ethereum" | "solana" | "bsc"

export interface ConnectionState {
  status: {
    ethereum: ConnectionStatus
    solana: ConnectionStatus
    bsc: ConnectionStatus
  }
  endpoints: {
    ethereum: string
    solana: string
    bsc: string
  }
  lastChecked: {
    ethereum: number
    solana: number
    bsc: number
  }
  errorMessages: {
    ethereum: string | null
    solana: string | null
    bsc: string | null
  }
  responseTime: {
    ethereum: number | null
    solana: number | null
    bsc: number | null
  }
  providers: {
    ethereum: ethers.JsonRpcProvider | null
    solana: Connection | null
    bsc: ethers.JsonRpcProvider | null
  }
  setStatus: (network: NetworkType, status: ConnectionStatus) => void
  setEndpoint: (network: NetworkType, endpoint: string) => void
  setErrorMessage: (network: NetworkType, message: string | null) => void
  setResponseTime: (network: NetworkType, time: number | null) => void
  setProvider: (network: NetworkType, provider: ethers.JsonRpcProvider | Connection | null) => void
  getOverallStatus: () => "healthy" | "degraded" | "critical"
  resetConnection: (network: NetworkType) => Promise<boolean>
}

// Helper function to ensure URL has proper protocol
function ensureHttpProtocol(url: string): string {
  if (!url) return ""

  // If it's already a valid URL with protocol, return it
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url
  }

  // If it's a relative path starting with /, it's a local API endpoint
  if (url.startsWith("/")) {
    // For client-side, we need to use the full URL
    if (typeof window !== "undefined") {
      return `${window.location.origin}${url}`
    }
    // For server-side, we'll use the relative path (will be handled by Next.js)
    return url
  }

  // Otherwise, assume it needs https:// prefix
  return `https://${url}`
}

// Create a store with Zustand
export const useConnectionStore = create<ConnectionState>()(
  persist(
    (set, get) => ({
      status: {
        ethereum: "disconnected",
        solana: "disconnected",
        bsc: "disconnected",
      },
      endpoints: {
        ethereum: process.env.ETHEREUM_RPC || config.rpcEndpoints?.ethereum || "",
        solana: process.env.SOLANA_RPC || config.rpcEndpoints?.solana || "",
        bsc: process.env.BSC_RPC || config.rpcEndpoints?.bsc || "",
      },
      lastChecked: {
        ethereum: 0,
        solana: 0,
        bsc: 0,
      },
      errorMessages: {
        ethereum: null,
        solana: null,
        bsc: null,
      },
      responseTime: {
        ethereum: null,
        solana: null,
        bsc: null,
      },
      providers: {
        ethereum: null,
        solana: null,
        bsc: null,
      },
      setStatus: (network, status) =>
        set((state) => ({
          status: { ...state.status, [network]: status },
          lastChecked: { ...state.lastChecked, [network]: Date.now() },
        })),
      setEndpoint: (network, endpoint) =>
        set((state) => ({
          endpoints: { ...state.endpoints, [network]: endpoint },
        })),
      setErrorMessage: (network, message) =>
        set((state) => ({
          errorMessages: { ...state.errorMessages, [network]: message },
        })),
      setResponseTime: (network, time) =>
        set((state) => ({
          responseTime: { ...state.responseTime, [network]: time },
        })),
      setProvider: (network, provider) =>
        set((state) => ({
          providers: { ...state.providers, [network]: provider },
        })),
      getOverallStatus: () => {
        const { status } = get()
        const connectedCount = Object.values(status).filter((s) => s === "connected").length
        const totalNetworks = Object.keys(status).length

        if (connectedCount === 0) return "critical"
        if (connectedCount === totalNetworks) return "healthy"
        return "degraded"
      },
      resetConnection: async (network) => {
        const startTime = performance.now()
        set((state) => ({
          status: { ...state.status, [network]: "connecting" },
          errorMessages: { ...state.errorMessages, [network]: null },
        }))

        try {
          if (network === "ethereum") {
            // For Ethereum, use our proxy endpoint
            const endpoint =
              typeof window !== "undefined"
                ? `${window.location.origin}/api/rpc/eth`
                : "https://eth-mainnet.g.alchemy.com/v2/demo" // Fallback for server-side

            console.log(`Connecting to Ethereum RPC: ${endpoint}`)
            const provider = new ethers.JsonRpcProvider(endpoint)
            await provider.getBlockNumber()

            const endTime = performance.now()
            set((state) => ({
              status: { ...state.status, ethereum: "connected" },
              providers: { ...state.providers, ethereum: provider },
              responseTime: {
                ...state.responseTime,
                ethereum: Math.round(endTime - startTime),
              },
              lastChecked: { ...state.lastChecked, ethereum: Date.now() },
            }))
            return true
          } else if (network === "solana") {
            // For Solana, use our proxy endpoint
            const endpoint =
              typeof window !== "undefined"
                ? `${window.location.origin}/api/rpc/sol`
                : "https://api.mainnet-beta.solana.com" // Fallback for server-side

            console.log(`Connecting to Solana RPC: ${endpoint}`)
            const connection = new Connection(endpoint, {
              commitment: "confirmed",
              disableRetryOnRateLimit: false,
              confirmTransactionInitialTimeout: 60000,
            })

            await connection.getSlot()

            const endTime = performance.now()
            set((state) => ({
              status: { ...state.status, solana: "connected" },
              providers: { ...state.providers, solana: connection },
              responseTime: {
                ...state.responseTime,
                solana: Math.round(endTime - startTime),
              },
              lastChecked: { ...state.lastChecked, solana: Date.now() },
            }))
            return true
          } else if (network === "bsc") {
            // For BSC, use our proxy endpoint
            const endpoint =
              typeof window !== "undefined"
                ? `${window.location.origin}/api/rpc/bsc`
                : "https://bsc-dataseed.binance.org/" // Fallback for server-side

            console.log(`Connecting to BSC RPC: ${endpoint}`)
            const provider = new ethers.JsonRpcProvider(endpoint)
            await provider.getBlockNumber()

            const endTime = performance.now()
            set((state) => ({
              status: { ...state.status, bsc: "connected" },
              providers: { ...state.providers, bsc: provider },
              responseTime: {
                ...state.responseTime,
                bsc: Math.round(endTime - startTime),
              },
              lastChecked: { ...state.lastChecked, bsc: Date.now() },
            }))
            return true
          }
          return false
        } catch (error) {
          console.error(`Error connecting to ${network}:`, error)
          set((state) => ({
            status: { ...state.status, [network]: "error" },
            errorMessages: {
              ...state.errorMessages,
              [network]: error instanceof Error ? error.message : String(error),
            },
          }))
          return false
        }
      },
    }),
    {
      name: "blockchain-connection-state",
      partialize: (state) => ({
        endpoints: state.endpoints,
      }),
    },
  ),
)

// Singleton class for managing blockchain connections
export class BlockchainConnectionManager {
  private static instance: BlockchainConnectionManager
  private checkInterval: NodeJS.Timeout | null = null
  private connectionStore = useConnectionStore

  private constructor() {
    // Private constructor to enforce singleton pattern
  }

  public static getInstance(): BlockchainConnectionManager {
    if (!BlockchainConnectionManager.instance) {
      BlockchainConnectionManager.instance = new BlockchainConnectionManager()
    }
    return BlockchainConnectionManager.instance
  }

  public async initialize(): Promise<void> {
    console.log("Initializing BlockchainConnectionManager")
    await this.checkAllConnections()
    this.startPeriodicChecks()
  }

  public async checkAllConnections(): Promise<void> {
    console.log("Checking all blockchain connections")
    await Promise.all([this.checkConnection("ethereum"), this.checkConnection("solana"), this.checkConnection("bsc")])
  }

  public async checkConnection(network: NetworkType): Promise<boolean> {
    return await this.connectionStore.getState().resetConnection(network)
  }

  public getConnectionStatus(network: NetworkType): ConnectionStatus {
    return this.connectionStore.getState().status[network]
  }

  public getAllConnectionStatus(): Record<NetworkType, ConnectionStatus> {
    return { ...this.connectionStore.getState().status }
  }

  public getOverallStatus(): "healthy" | "degraded" | "critical" {
    return this.connectionStore.getState().getOverallStatus()
  }

  public getProvider(network: NetworkType): ethers.JsonRpcProvider | Connection | null {
    return this.connectionStore.getState().providers[network]
  }

  public getErrorMessage(network: NetworkType): string | null {
    return this.connectionStore.getState().errorMessages[network]
  }

  public getResponseTime(network: NetworkType): number | null {
    return this.connectionStore.getState().responseTime[network]
  }

  public getLastChecked(network: NetworkType): number {
    return this.connectionStore.getState().lastChecked[network]
  }

  public startPeriodicChecks(intervalMs = 30000): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
    }

    this.checkInterval = setInterval(() => {
      this.checkAllConnections()
    }, intervalMs)
  }

  public stopPeriodicChecks(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval)
      this.checkInterval = null
    }
  }

  public setEndpoint(network: NetworkType, endpoint: string): void {
    this.connectionStore.getState().setEndpoint(network, endpoint)
  }

  public cleanup(): void {
    this.stopPeriodicChecks()
  }
}

// Create a React hook for using the connection manager
export function useBlockchainConnection() {
  const connectionStore = useConnectionStore()

  return {
    status: connectionStore.status,
    endpoints: connectionStore.endpoints,
    errorMessages: connectionStore.errorMessages,
    responseTime: connectionStore.responseTime,
    lastChecked: connectionStore.lastChecked,
    overallStatus: connectionStore.getOverallStatus(),
    resetConnection: connectionStore.resetConnection,
    setEndpoint: connectionStore.setEndpoint,
  }
}
