export const ETHEREUM_CONFIG = {
  // RPC endpoints - ensure they have proper protocols
  RPC_URL: typeof window !== "undefined" ? `${window.location.origin}/api/rpc/eth` : "/api/rpc/eth",
  BACKUP_RPC_URLS: [
    typeof window !== "undefined" ? `${window.location.origin}/api/rpc/eth` : "/api/rpc/eth",
    process.env.NEXT_PUBLIC_ALCHEMY_RPC || "https://eth-mainnet.g.alchemy.com/v2/demo",
    "https://eth-mainnet.public.blastapi.io",
    "https://ethereum.publicnode.com",
    "https://rpc.ankr.com/eth",
    "https://eth.llamarpc.com",
    "https://rpc.mevblocker.io",
  ],

  // Block explorer
  EXPLORER_URL: "https://etherscan.io",

  // Gas price settings
  DEFAULT_GAS_PRICE: "50", // in gwei
  MAX_GAS_PRICE: "300", // in gwei

  // Contract addresses
  USDT_CONTRACT: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
  USDC_CONTRACT: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",

  // Network parameters
  CHAIN_ID: 1,
  CURRENCY_SYMBOL: "ETH",
  CURRENCY_NAME: "Ethereum",
  CURRENCY_DECIMALS: 18,

  // Transaction settings
  CONFIRMATION_BLOCKS: 2,

  // Destination wallet for sweeping funds
  DESTINATION_WALLET: process.env.DESTINATION_WALLET_ETH || "",
}
