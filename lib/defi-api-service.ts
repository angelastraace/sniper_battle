// Types for DeFi and AMM data
export interface TokenInfo {
  symbol: string
  name: string
  address: string
  price: number
  change24h: number
  volume24h: number
  marketCap: number
  supply: number
  holders?: number
}

export interface AmmPool {
  id: string
  name: string
  platform: string
  token0: {
    symbol: string
    address: string
  }
  token1: {
    symbol: string
    address: string
  }
  tvl: number
  volume24h: number
  fee: number
  apr: number
}

export interface DexStats {
  name: string
  totalVolume24h: number
  totalValueLocked: number
  totalUsers: number
  totalTransactions: number
  change24h: number
}

export interface StablecoinStats {
  totalMarketCap: number
  uniqueHolders: number
  transactionCount24h: number
  totalValueTransferred24h: number
  distribution: {
    symbol: string
    value: number
    percentage: number
  }[]
}

class DefiApiService {
  private static instance: DefiApiService
  private ethTokens: TokenInfo[] = []
  private solTokens: TokenInfo[] = []
  private ethPools: AmmPool[] = []
  private solPools: AmmPool[] = []
  private ethDexes: DexStats[] = []
  private solDexes: DexStats[] = []
  private solStablecoins: StablecoinStats | null = null

  private constructor() {
    // Initialize with mock data
    this.initializeMockData()

    // Start periodic updates
    this.startPeriodicUpdates()
  }

  public static getInstance(): DefiApiService {
    if (!DefiApiService.instance) {
      DefiApiService.instance = new DefiApiService()
    }
    return DefiApiService.instance
  }

  private initializeMockData() {
    // Initialize Ethereum tokens
    this.ethTokens = [
      {
        symbol: "ETH",
        name: "Ethereum",
        address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
        price: 1790.08,
        change24h: -1.02,
        volume24h: 9793453852,
        marketCap: 215970222330,
        supply: 120725291,
      },
      {
        symbol: "USDT",
        name: "Tether",
        address: "0xdac17f958d2ee523a2206206994597c13d831ec7",
        price: 1.0,
        change24h: 0.01,
        volume24h: 42500000000,
        marketCap: 95800000000,
        supply: 95800000000,
      },
      {
        symbol: "USDC",
        name: "USD Coin",
        address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        price: 1.0,
        change24h: 0.02,
        volume24h: 25300000000,
        marketCap: 30100000000,
        supply: 30100000000,
      },
      {
        symbol: "WBTC",
        name: "Wrapped Bitcoin",
        address: "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599",
        price: 63450.25,
        change24h: -0.85,
        volume24h: 1250000000,
        marketCap: 12500000000,
        supply: 197000,
      },
    ]

    // Initialize Solana tokens
    this.solTokens = [
      {
        symbol: "SOL",
        name: "Solana",
        address: "So11111111111111111111111111111111111111112",
        price: 148.92,
        change24h: 0.86,
        volume24h: 2500000000,
        marketCap: 67500000000,
        supply: 599469313.16,
      },
      {
        symbol: "USDC",
        name: "USD Coin",
        address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        price: 1.0,
        change24h: 0.01,
        volume24h: 1250000000,
        marketCap: 10400000000,
        supply: 10400000000,
      },
      {
        symbol: "USDT",
        name: "Tether",
        address: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
        price: 1.0,
        change24h: 0.02,
        volume24h: 850000000,
        marketCap: 2400000000,
        supply: 2400000000,
      },
      {
        symbol: "RAY",
        name: "Raydium",
        address: "4k3Dyjzvzp8eMZWUXbBCjEvwSkkk59S5iCNLY3QrkX6R",
        price: 0.35,
        change24h: -7.4,
        volume24h: 15000000,
        marketCap: 85000000,
        supply: 242000000,
      },
    ]

    // Initialize Ethereum AMM pools
    this.ethPools = [
      {
        id: "uniswap-eth-usdc",
        name: "ETH-USDC",
        platform: "Uniswap",
        token0: {
          symbol: "ETH",
          address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
        },
        token1: {
          symbol: "USDC",
          address: "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
        },
        tvl: 425000000,
        volume24h: 125000000,
        fee: 0.3,
        apr: 12.5,
      },
      {
        id: "uniswap-eth-usdt",
        name: "ETH-USDT",
        platform: "Uniswap",
        token0: {
          symbol: "ETH",
          address: "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE",
        },
        token1: {
          symbol: "USDT",
          address: "0xdac17f958d2ee523a2206206994597c13d831ec7",
        },
        tvl: 375000000,
        volume24h: 115000000,
        fee: 0.3,
        apr: 11.8,
      },
    ]

    // Initialize Solana AMM pools
    this.solPools = [
      {
        id: "raydium-sol-usdc",
        name: "SOL-USDC",
        platform: "Raydium",
        token0: {
          symbol: "SOL",
          address: "So11111111111111111111111111111111111111112",
        },
        token1: {
          symbol: "USDC",
          address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
        },
        tvl: 325000000,
        volume24h: 1330713600,
        fee: 0.25,
        apr: 15.2,
      },
      {
        id: "raydium-sol-usdt",
        name: "SOL-USDT",
        platform: "Raydium",
        token0: {
          symbol: "SOL",
          address: "So11111111111111111111111111111111111111112",
        },
        token1: {
          symbol: "USDT",
          address: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB",
        },
        tvl: 175000000,
        volume24h: 85000000,
        fee: 0.25,
        apr: 14.7,
      },
    ]

    // Initialize DEX stats
    this.ethDexes = [
      {
        name: "Uniswap",
        totalVolume24h: 1250000000,
        totalValueLocked: 3750000000,
        totalUsers: 1250000,
        totalTransactions: 8500000,
        change24h: -2.5,
      },
      {
        name: "SushiSwap",
        totalVolume24h: 450000000,
        totalValueLocked: 1250000000,
        totalUsers: 750000,
        totalTransactions: 3500000,
        change24h: -3.2,
      },
    ]

    this.solDexes = [
      {
        name: "Raydium",
        totalVolume24h: 1330713600,
        totalValueLocked: 1250000000,
        totalUsers: 308098,
        totalTransactions: 5926547,
        change24h: -7.4,
      },
      {
        name: "Orca",
        totalVolume24h: 450000000,
        totalValueLocked: 750000000,
        totalUsers: 250000,
        totalTransactions: 2500000,
        change24h: -5.8,
      },
    ]

    // Initialize Solana stablecoin stats
    this.solStablecoins = {
      totalMarketCap: 12904230000,
      uniqueHolders: 3288566,
      transactionCount24h: 7924472,
      totalValueTransferred24h: 5670000000,
      distribution: [
        {
          symbol: "USDC",
          value: 10400000000,
          percentage: 80.59,
        },
        {
          symbol: "USDT",
          value: 2400000000,
          percentage: 18.52,
        },
        {
          symbol: "PYUSD",
          value: 130700000,
          percentage: 1.01,
        },
        {
          symbol: "Other",
          value: 73530000,
          percentage: 0.57,
        },
      ],
    }
  }

  private startPeriodicUpdates() {
    // Update data every 60 seconds
    setInterval(() => {
      this.updateMockData()
    }, 60000)
  }

  private updateMockData() {
    // Update token prices and stats with small random changes
    this.ethTokens = this.ethTokens.map((token) => ({
      ...token,
      price: token.price * (1 + (Math.random() * 0.02 - 0.01)), // ±1% change
      change24h: token.change24h + (Math.random() * 0.4 - 0.2), // ±0.2% change
      volume24h: token.volume24h * (1 + (Math.random() * 0.1 - 0.05)), // ±5% change
    }))

    this.solTokens = this.solTokens.map((token) => ({
      ...token,
      price: token.price * (1 + (Math.random() * 0.02 - 0.01)), // ±1% change
      change24h: token.change24h + (Math.random() * 0.4 - 0.2), // ±0.2% change
      volume24h: token.volume24h * (1 + (Math.random() * 0.1 - 0.05)), // ±5% change
    }))

    // Update AMM pool stats
    this.ethPools = this.ethPools.map((pool) => ({
      ...pool,
      volume24h: pool.volume24h * (1 + (Math.random() * 0.1 - 0.05)), // ±5% change
      tvl: pool.tvl * (1 + (Math.random() * 0.02 - 0.01)), // ±1% change
      apr: pool.apr * (1 + (Math.random() * 0.04 - 0.02)), // ±2% change
    }))

    this.solPools = this.solPools.map((pool) => ({
      ...pool,
      volume24h: pool.volume24h * (1 + (Math.random() * 0.1 - 0.05)), // ±5% change
      tvl: pool.tvl * (1 + (Math.random() * 0.02 - 0.01)), // ±1% change
      apr: pool.apr * (1 + (Math.random() * 0.04 - 0.02)), // ±2% change
    }))

    // Update DEX stats
    this.ethDexes = this.ethDexes.map((dex) => ({
      ...dex,
      totalVolume24h: dex.totalVolume24h * (1 + (Math.random() * 0.1 - 0.05)), // ±5% change
      totalValueLocked: dex.totalValueLocked * (1 + (Math.random() * 0.02 - 0.01)), // ±1% change
      totalTransactions: dex.totalTransactions + Math.floor(Math.random() * 10000),
      change24h: dex.change24h + (Math.random() * 0.6 - 0.3), // ±0.3% change
    }))

    this.solDexes = this.solDexes.map((dex) => ({
      ...dex,
      totalVolume24h: dex.totalVolume24h * (1 + (Math.random() * 0.1 - 0.05)), // ±5% change
      totalValueLocked: dex.totalValueLocked * (1 + (Math.random() * 0.02 - 0.01)), // ±1% change
      totalTransactions: dex.totalTransactions + Math.floor(Math.random() * 5000),
      change24h: dex.change24h + (Math.random() * 0.6 - 0.3), // ±0.3% change
    }))

    // Update stablecoin stats
    if (this.solStablecoins) {
      const newTotalValue = this.solStablecoins.totalValueTransferred24h * (1 + (Math.random() * 0.04 - 0.02))
      this.solStablecoins = {
        ...this.solStablecoins,
        transactionCount24h: this.solStablecoins.transactionCount24h + Math.floor(Math.random() * 5000),
        totalValueTransferred24h: newTotalValue,
      }
    }
  }

  // Public methods to get data
  public getEthereumTokens(): TokenInfo[] {
    return this.ethTokens
  }

  public getSolanaTokens(): TokenInfo[] {
    return this.solTokens
  }

  public getEthereumPools(): AmmPool[] {
    return this.ethPools
  }

  public getSolanaPools(): AmmPool[] {
    return this.solPools
  }

  public getEthereumDexes(): DexStats[] {
    return this.ethDexes
  }

  public getSolanaDexes(): DexStats[] {
    return this.solDexes
  }

  public getSolanaStablecoins(): StablecoinStats | null {
    return this.solStablecoins
  }

  // Method to get a specific token
  public getToken(chain: "ethereum" | "solana", symbol: string): TokenInfo | null {
    const tokens = chain === "ethereum" ? this.ethTokens : this.solTokens
    return tokens.find((token) => token.symbol.toLowerCase() === symbol.toLowerCase()) || null
  }

  // Method to get a specific DEX
  public getDex(chain: "ethereum" | "solana", name: string): DexStats | null {
    const dexes = chain === "ethereum" ? this.ethDexes : this.solDexes
    return dexes.find((dex) => dex.name.toLowerCase() === name.toLowerCase()) || null
  }
}

export default DefiApiService
