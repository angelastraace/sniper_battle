export const SOLANA_CONFIG = {
  // RPC endpoints
  RPC_URL: "/api/rpc/solana", // Updated to use our proxy
  BACKUP_RPC_URLS: [
    "/api/rpc/solana", // Primary proxy endpoint
    process.env.SOLANA_RPC || "https://api.mainnet-beta.solana.com",
    "https://solana-api.projectserum.com",
    "https://rpc.ankr.com/solana",
    "https://solana-mainnet.rpc.extrnode.com",
  ],

  // Block explorer
  EXPLORER_URL: "https://solscan.io",

  // Network parameters
  CURRENCY_SYMBOL: "SOL",
  CURRENCY_NAME: "Solana",
  CURRENCY_DECIMALS: 9,

  // Transaction settings
  CONFIRMATION_BLOCKS: 1,

  // Destination wallet for sweeping funds
  DESTINATION_WALLET: process.env.DESTINATION_WALLET_SOL || "",
}
