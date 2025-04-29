export const SOLANA_CONFIG = {
  // RPC endpoints
  RPC_URL: process.env.SOLANA_RPC || "https://api.mainnet-beta.solana.com",
  BACKUP_RPC_URLS: [
    "https://solana-api.projectserum.com",
    "https://rpc.ankr.com/solana",
    "https://solana-mainnet.rpc.extrnode.com",
    "https://ssc-dao.genesysgo.net",
    "https://mainnet.helius-rpc.com/?api-key=15319106-7f58-4328-89be-3bf06d7c5b96",
    "https://solana.getblock.io/mainnet/?api_key=demo",
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
