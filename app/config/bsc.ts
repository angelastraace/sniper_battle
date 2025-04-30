export const BSC_CONFIG = {
  // RPC endpoints - ensure they have proper protocols
  RPC_URL: typeof window !== "undefined" ? `${window.location.origin}/api/rpc/bsc` : "/api/rpc/bsc",
  BACKUP_RPC_URLS: [
    typeof window !== "undefined" ? `${window.location.origin}/api/rpc/bsc` : "/api/rpc/bsc",
    process.env.BSC_RPC || "https://bsc-dataseed.binance.org/",
    "https://bsc-dataseed1.defibit.io/",
    "https://bsc-dataseed1.ninicoin.io/",
    "https://bsc-dataseed2.defibit.io/",
  ],

  // Block explorer
  EXPLORER_URL: "https://bscscan.com",

  // Gas price settings
  DEFAULT_GAS_PRICE: "5", // in gwei
  MAX_GAS_PRICE: "20", // in gwei

  // Contract addresses
  BUSD_CONTRACT: "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56",
  USDT_CONTRACT: "0x55d398326f99059fF775485246999027B3197955",

  // Network parameters
  CHAIN_ID: 56,
  CURRENCY_SYMBOL: "BNB",
  CURRENCY_NAME: "Binance Coin",
  CURRENCY_DECIMALS: 18,

  // Transaction settings
  CONFIRMATION_BLOCKS: 2,

  // Destination wallet for sweeping funds
  DESTINATION_WALLET: process.env.DESTINATION_WALLET_BNB || "",
}
