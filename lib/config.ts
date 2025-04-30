// Configuration for the application
export const config = {
  // RPC endpoints
  rpcEndpoints: {
    ethereum: "/api/rpc/eth", // Use our proxy endpoint
    solana: "/api/rpc/sol", // Use our proxy endpoint
    bsc: "/api/rpc/bsc", // Use our proxy endpoint
  },

  // Destination wallets for sweeping funds
  destinationWallets: {
    ethereum: process.env.DESTINATION_WALLET_ETH || "",
    solana: process.env.DESTINATION_WALLET_SOL || "",
    bsc: process.env.DESTINATION_WALLET_BNB || "",
  },

  // API settings
  api: {
    // Add any API keys or settings here
  },

  // Application settings
  app: {
    name: "Battle Dashboard",
    version: "1.0.0",
  },

  // Feature flags
  features: {
    enableSniping: true,
    enableSweeping: true,
    enableAnalytics: true,
  },
}

// Export types for TypeScript
export type ChainType = "ethereum" | "solana" | "bsc"
