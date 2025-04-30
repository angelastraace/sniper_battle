export const BSC_CONFIG = {
  // RPC endpoints
  RPC_URL: "/api/rpc/bsc", // Updated to use our proxy
  BACKUP_RPC_URLS: [
    "/api/rpc/bsc", // Primary proxy endpoint
    process.env.BSC_RPC || "https://bsc-dataseed.binance.org",
    "https://bsc-dataseed1.defibit.io",
    "https://bsc-dataseed1.ninicoin.io",
  ],

  // Block explorer
  EXPLORER_URL: "https://bscscan.com",

  // Gas price settings
  DEFAULT_GAS_PRICE: "5", // in gwei
  MAX_GAS_PRICE: "20", // in gwei

  // Network parameters
  CHAIN_ID: 56,
  CURRENCY_SYMBOL: "BNB",
  CURRENCY_NAME: "Binance Coin",
  CURRENCY_DECIMALS: 18,

  // Transaction settings
  CONFIRMATION_BLOCKS: 1,

  // Destination wallet for sweeping funds
  DESTINATION_WALLET: process.env.DESTINATION_WALLET_BNB || "",
}
