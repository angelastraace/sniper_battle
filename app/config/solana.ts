export const SOLANA_CONFIG = {
  // RPC endpoints - using the Pages Router API endpoint
  RPC_URL: typeof window !== "undefined" ? `${window.location.origin}/api/solana` : "/api/solana",
  BACKUP_RPC_URLS: [
    typeof window !== "undefined" ? `${window.location.origin}/api/solana` : "/api/solana",
    process.env.SOLANA_PROXY_URL || "/api/rpc/solana",
  ],

  // Block explorer
  EXPLORER_URL: "https://solscan.io",

  // Token programs
  TOKEN_PROGRAM_ID: "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA",
  ASSOCIATED_TOKEN_PROGRAM_ID: "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL",

  // Well-known tokens
  USDC_MINT: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
  USDT_MINT: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",

  // Network parameters
  CURRENCY_SYMBOL: "SOL",
  CURRENCY_NAME: "Solana",
  CURRENCY_DECIMALS: 9,

  // Transaction settings
  CONFIRMATION_BLOCKS: 32,

  // Destination wallet for sweeping funds
  DESTINATION_WALLET: process.env.DESTINATION_WALLET_SOL || "",
}
