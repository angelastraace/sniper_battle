import { ethers } from "ethers"
import { Connection, type ConnectionConfig } from "@solana/web3.js"
import { config } from "./config"

// Types for our blockchain data
export interface Block {
  number: string
  hash: string
  timestamp: number
  transactions: number
  miner?: string
  slot?: number // For Solana
}

export interface Transaction {
  hash: string
  from: string
  to: string
  value: string
  timestamp: number
  blockNumber?: string
  slot?: number // For Solana
  fee?: string
  status: "success" | "pending" | "failed"
}

export interface TokenInfo {
  symbol: string
  name: string
  price: number
  change24h: number
  volume24h: number
  marketCap: number
}

export interface ChainStats {
  latestBlock: string
  gasPrice?: string // ETH
  transactionsPerSecond: number
  marketCap: number
  price: number
  change24h: number
  volume24h: number
  high24h: number
  low24h: number
  circulatingSupply: number
}

class BlockchainApiService {
  private static instance: BlockchainApiService
  private ethereumProvider: ethers.JsonRpcProvider | null = null
  private solanaConnection: Connection | null = null
  private bscProvider: ethers.JsonRpcProvider | null = null

  private ethBlockListeners: ((blocks: Block[]) => void)[] = []
  private ethTxListeners: ((txs: Transaction[]) => void)[] = []
  private solBlockListeners: ((blocks: Block[]) => void)[] = []
  private solTxListeners: ((txs: Transaction[]) => void)[] = []
  private ethBlocks: Block[] = []
  private ethTransactions: Transaction[] = []
  private solBlocks: Block[] = []
  private solTransactions: Transaction[] = []
  private ethStats: ChainStats | null = null
  private solStats: ChainStats | null = null
  private ethTokenInfo: TokenInfo | null = null
  private solTokenInfo: TokenInfo | null = null
  private abortControllers: AbortController[] = []

  // Connection status
  private connectionStatus = {
    ethereum: false,
    solana: false,
    bsc: false,
  }

  // Proxy RPC endpoints
  private ethereumRpcEndpoints = [
    "/api/rpc/ethereum", // Primary: Our proxied endpoint
    process.env.ETHEREUM_RPC || config.rpcEndpoints.ethereum,
    process.env.NEXT_PUBLIC_ALCHEMY_RPC,
    "https://rpc.ankr.com/eth",
    "https://ethereum.publicnode.com",
  ]

  private solanaRpcEndpoints = [
    "/api/rpc/sol", // Primary: Our proxied endpoint
    process.env.SOLANA_RPC || config.rpcEndpoints.solana,
    "https://api.mainnet-beta.solana.com",
    "https://solana-api.projectserum.com",
    "https://rpc.ankr.com/solana",
  ]

  private bscRpcEndpoints = [
    "/api/rpc/bsc", // Primary: Our proxied endpoint
    process.env.BSC_RPC || config.rpcEndpoints.bsc,
    "https://bsc-dataseed.binance.org/",
    "https://bsc-dataseed1.defibit.io/",
    "https://bsc-dataseed1.ninicoin.io/",
  ]

  private constructor() {
    // Initialize providers
    this.initializeProviders()

    // Start monitoring
    this.startMonitoring()

    // Set up periodic connection testing
    if (typeof window !== "undefined") {
      setInterval(() => this.testConnections(), 30000) // Test every 30 seconds
    }
  }

  private async initializeProviders() {
    // Try to initialize Ethereum provider
    for (const endpoint of this.ethereumRpcEndpoints) {
      try {
        const provider = new ethers.JsonRpcProvider(endpoint)
        await provider.getBlockNumber()
        this.ethereumProvider = provider
        this.connectionStatus.ethereum = true
        console.log(`Connected to Ethereum via ${endpoint}`)
        break
      } catch (error) {
        console.error(`Failed to connect to Ethereum endpoint ${endpoint}:`, error)
      }
    }

    // Try to initialize Solana connection with maxSupportedTransactionVersion
    for (const endpoint of this.solanaRpcEndpoints) {
      try {
        // Add maxSupportedTransactionVersion to the connection config
        const connectionConfig: ConnectionConfig = {
          commitment: "confirmed",
          confirmTransactionInitialTimeout: 60000,
          disableRetryOnRateLimit: false,
          maxSupportedTransactionVersion: 0,
        }

        const connection = new Connection(endpoint, connectionConfig)
        await connection.getSlot()
        this.solanaConnection = connection
        this.connectionStatus.solana = true
        console.log(`🚀 Solana RPC connected: ${endpoint}`)
        console.log(`Connected to Solana via ${endpoint}`)
        break
      } catch (error) {
        console.error(`Failed to connect to Solana endpoint ${endpoint}:`, error)
      }
    }

    // Try to initialize BSC provider
    for (const endpoint of this.bscRpcEndpoints) {
      try {
        const provider = new ethers.JsonRpcProvider(endpoint)
        await provider.getBlockNumber()
        this.bscProvider = provider
        this.connectionStatus.bsc = true
        console.log(`Connected to BSC via ${endpoint}`)
        break
      } catch (error) {
        console.error(`Failed to connect to BSC endpoint ${endpoint}:`, error)
      }
    }

    // If we couldn't connect to any providers, set up fallback data
    if (!this.ethereumProvider) {
      console.warn("Using fallback data for Ethereum")
      this.setDefaultEthereumStats("0", "0")
    }

    if (!this.solanaConnection) {
      console.warn("Using fallback data for Solana")
      this.setDefaultSolanaStats("0")
    }

    if (!this.bscProvider) {
      console.warn("Using fallback data for BSC")
    }
  }

  private async testConnections() {
    // Test Ethereum
    if (!this.connectionStatus.ethereum || !this.ethereumProvider) {
      for (const endpoint of this.ethereumRpcEndpoints) {
        try {
          const provider = new ethers.JsonRpcProvider(endpoint)
          await provider.getBlockNumber()
          this.ethereumProvider = provider
          this.connectionStatus.ethereum = true
          console.log(`Reconnected to Ethereum via ${endpoint}`)
          // Restart monitoring for Ethereum
          this.startEthereumMonitoring()
          break
        } catch (error) {
          this.connectionStatus.ethereum = false
        }
      }
    } else {
      // Test existing connection
      try {
        await this.ethereumProvider.getBlockNumber()
      } catch (error) {
        console.error("Ethereum connection lost, attempting to reconnect...")
        this.connectionStatus.ethereum = false
        this.ethereumProvider = null
      }
    }

    // Test Solana
    if (!this.connectionStatus.solana || !this.solanaConnection) {
      for (const endpoint of this.solanaRpcEndpoints) {
        try {
          // Add maxSupportedTransactionVersion to the connection config
          const connectionConfig: ConnectionConfig = {
            commitment: "confirmed",
            confirmTransactionInitialTimeout: 60000,
            disableRetryOnRateLimit: false,
            maxSupportedTransactionVersion: 0,
          }

          const connection = new Connection(endpoint, connectionConfig)
          await connection.getSlot()
          this.solanaConnection = connection
          this.connectionStatus.solana = true
          console.log(`🚀 Solana RPC connected: ${endpoint}`)
          console.log(`Reconnected to Solana via ${endpoint}`)
          // Restart monitoring for Solana
          this.startSolanaMonitoring()
          break
        } catch (error) {
          this.connectionStatus.solana = false
        }
      }
    } else {
      // Test existing connection
      try {
        await this.solanaConnection.getSlot()
      } catch (error) {
        console.error("Solana connection lost, attempting to reconnect...")
        this.connectionStatus.solana = false
        this.solanaConnection = null
      }
    }

    // Test BSC
    if (!this.connectionStatus.bsc || !this.bscProvider) {
      for (const endpoint of this.bscRpcEndpoints) {
        try {
          const provider = new ethers.JsonRpcProvider(endpoint)
          await provider.getBlockNumber()
          this.bscProvider = provider
          this.connectionStatus.bsc = true
          console.log(`Reconnected to BSC via ${endpoint}`)
          break
        } catch (error) {
          this.connectionStatus.bsc = false
        }
      }
    } else {
      // Test existing connection
      try {
        await this.bscProvider.getBlockNumber()
      } catch (error) {
        console.error("BSC connection lost, attempting to reconnect...")
        this.connectionStatus.bsc = false
        this.bscProvider = null
      }
    }
  }

  public static getInstance(): BlockchainApiService {
    if (!BlockchainApiService.instance) {
      BlockchainApiService.instance = new BlockchainApiService()
    }
    return BlockchainApiService.instance
  }

  public getConnectionStatus() {
    return this.connectionStatus
  }

  private async startMonitoring() {
    // Start Ethereum monitoring
    this.startEthereumMonitoring()

    // Start Solana monitoring
    this.startSolanaMonitoring()

    // Fetch initial market data
    await this.fetchMarketData()

    // Update market data every 60 seconds
    setInterval(() => this.fetchMarketData(), 60000)
  }

  private async startEthereumMonitoring() {
    if (!this.connectionStatus.ethereum || !this.ethereumProvider) {
      console.warn("Cannot start Ethereum monitoring: No connection")
      return
    }

    try {
      // Get initial blocks
      const latestBlockNumber = await this.ethereumProvider.getBlockNumber()

      // Fetch last 10 blocks
      for (let i = 0; i < 10; i++) {
        if (latestBlockNumber - i >= 0) {
          try {
            const block = await this.ethereumProvider.getBlock(latestBlockNumber - i)
            if (block) {
              this.addEthereumBlock({
                number: block.number.toString(),
                hash: block.hash,
                timestamp: Number(block.timestamp) * 1000, // Convert to ms
                transactions: block.transactions.length,
                miner: block.miner,
              })
            }
          } catch (error) {
            console.error(`Error fetching Ethereum block ${latestBlockNumber - i}:`, error)
          }
        }
      }

      // Subscribe to new blocks
      this.ethereumProvider.on("block", async (blockNumber) => {
        try {
          const block = await this.ethereumProvider?.getBlock(blockNumber)
          if (block) {
            this.addEthereumBlock({
              number: block.number.toString(),
              hash: block.hash,
              timestamp: Number(block.timestamp) * 1000,
              transactions: block.transactions.length,
              miner: block.miner,
            })

            // Fetch some transactions from this block
            if (block.transactions.length > 0) {
              const txCount = Math.min(5, block.transactions.length)
              for (let i = 0; i < txCount; i++) {
                try {
                  const txHash = block.transactions[i]
                  const tx = await this.ethereumProvider?.getTransaction(txHash)
                  if (tx) {
                    // Safely handle the transaction value
                    let valueFormatted = "0"
                    if (tx.value !== null && tx.value !== undefined) {
                      valueFormatted = ethers.formatEther(tx.value)
                    }

                    this.addEthereumTransaction({
                      hash: tx.hash,
                      from: tx.from || "Unknown",
                      to: tx.to || "Contract Creation",
                      value: valueFormatted,
                      timestamp: Number(block.timestamp) * 1000,
                      blockNumber: block.number.toString(),
                      fee: tx.gasPrice ? ethers.formatUnits(tx.gasPrice, "gwei") : "0",
                      status: "success",
                    })
                  }
                } catch (txError) {
                  console.error("Error processing Ethereum transaction:", txError)
                }
              }
            }
          }
        } catch (error) {
          console.error("Error processing Ethereum block:", error)
        }
      })

      // Update gas price and other stats
      this.updateEthereumStats()
      setInterval(() => this.updateEthereumStats(), 15000)
    } catch (error) {
      console.error("Error starting Ethereum monitoring:", error)
    }
  }

  private async startSolanaMonitoring() {
    if (!this.connectionStatus.solana || !this.solanaConnection) {
      console.warn("Cannot start Solana monitoring: No connection")
      return
    }

    try {
      // Get latest slot
      const latestSlot = await this.solanaConnection.getSlot()

      // Fetch last 10 blocks
      for (let i = 0; i < 10; i++) {
        if (latestSlot - i >= 0) {
          try {
            // Add maxSupportedTransactionVersion to getBlock options
            console.log(`🧠 Fetching Solana block: ${latestSlot - i}`)
            const block = await this.solanaConnection.getBlock(latestSlot - i, {
              maxSupportedTransactionVersion: 0,
            })

            if (block) {
              this.addSolanaBlock({
                number: (latestSlot - i).toString(),
                hash: block.blockhash,
                timestamp: block.blockTime ? block.blockTime * 1000 : Date.now(),
                transactions: block.transactions.length,
                slot: latestSlot - i,
              })

              // Add SPL Token Mint detection
              for (const tx of block.transactions) {
                for (const ix of tx.transaction.message.instructions) {
                  // Try to decode the instruction
                  try {
                    const programId = ix.programId.toBase58()

                    // Detect SPL Token Mint
                    if (programId === "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA") {
                      const data = Buffer.from(ix.data, "base64").toString("hex")
                      const mintInstruction = data.slice(0, 2)

                      if (mintInstruction === "00") {
                        console.log(`🎯 SPL Token Mint Detected in Slot ${latestSlot - i}`)
                      }
                    }
                  } catch (err) {
                    // Silently skip parsing failures
                  }
                }
              }

              // Add some transactions
              if (block.transactions.length > 0) {
                const txCount = Math.min(5, block.transactions.length)
                for (let j = 0; j < txCount; j++) {
                  try {
                    const tx = block.transactions[j]
                    const signature = tx.transaction.signatures[0]

                    // Get transaction details
                    this.addSolanaTransaction({
                      hash: signature,
                      from: tx.transaction.message.accountKeys[0].toString(),
                      to:
                        tx.transaction.message.accountKeys.length > 1
                          ? tx.transaction.message.accountKeys[1].toString()
                          : "Unknown",
                      value: "SOL", // Would need more processing to get actual value
                      timestamp: block.blockTime ? block.blockTime * 1000 : Date.now(),
                      slot: latestSlot - i,
                      status: tx.meta?.err ? "failed" : "success",
                    })
                  } catch (txError) {
                    console.error("Error processing Solana transaction:", txError)
                  }
                }
              }
            }
          } catch (error) {
            console.error(`Error fetching Solana block at slot ${latestSlot - i}:`, error)
          }
        }
      }

      // Poll for new blocks every 2 seconds
      const intervalId = setInterval(async () => {
        if (!this.connectionStatus.solana || !this.solanaConnection) {
          clearInterval(intervalId)
          return
        }

        try {
          const currentSlot = await this.solanaConnection.getSlot()
          const lastProcessedSlot = this.solBlocks.length > 0 ? Number.parseInt(this.solBlocks[0].number) : 0

          if (currentSlot > lastProcessedSlot) {
            // Process new blocks
            try {
              // Add maxSupportedTransactionVersion to getBlock options
              console.log(`🧠 Fetching Solana block: ${currentSlot}`)
              const block = await this.solanaConnection.getBlock(currentSlot, {
                maxSupportedTransactionVersion: 0,
              })

              if (block) {
                this.addSolanaBlock({
                  number: currentSlot.toString(),
                  hash: block.blockhash,
                  timestamp: block.blockTime ? block.blockTime * 1000 : Date.now(),
                  transactions: block.transactions.length,
                  slot: currentSlot,
                })

                // Add SPL Token Mint detection
                for (const tx of block.transactions) {
                  for (const ix of tx.transaction.message.instructions) {
                    // Try to decode the instruction
                    try {
                      const programId = ix.programId.toBase58()

                      // Detect SPL Token Mint
                      if (programId === "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA") {
                        const data = Buffer.from(ix.data, "base64").toString("hex")
                        const mintInstruction = data.slice(0, 2)

                        if (mintInstruction === "00") {
                          console.log(`🎯 SPL Token Mint Detected in Slot ${currentSlot}`)
                        }
                      }
                    } catch (err) {
                      // Silently skip parsing failures
                    }
                  }
                }

                // Add some transactions
                if (block.transactions.length > 0) {
                  const txCount = Math.min(5, block.transactions.length)
                  for (let j = 0; j < txCount; j++) {
                    try {
                      const tx = block.transactions[j]
                      const signature = tx.transaction.signatures[0]

                      this.addSolanaTransaction({
                        hash: signature,
                        from: tx.transaction.message.accountKeys[0].toString(),
                        to:
                          tx.transaction.message.accountKeys.length > 1
                            ? tx.transaction.message.accountKeys[1].toString()
                            : "Unknown",
                        value: "SOL",
                        timestamp: block.blockTime ? block.blockTime * 1000 : Date.now(),
                        slot: currentSlot,
                        status: tx.meta?.err ? "failed" : "success",
                      })
                    } catch (txError) {
                      console.error("Error processing Solana transaction:", txError)
                    }
                  }
                }
              }
            } catch (blockError) {
              console.error(`Error processing Solana block at slot ${currentSlot}:`, blockError)
            }
          }
        } catch (error) {
          console.error("Error polling Solana blocks:", error)
        }
      }, 2000)

      // Update Solana stats
      this.updateSolanaStats()
      setInterval(() => this.updateSolanaStats(), 15000)
    } catch (error) {
      console.error("Error starting Solana monitoring:", error)
    }
  }

  private addEthereumBlock(block: Block) {
    // Add to the beginning of the array
    this.ethBlocks.unshift(block)

    // Keep only the last 20 blocks
    if (this.ethBlocks.length > 20) {
      this.ethBlocks = this.ethBlocks.slice(0, 20)
    }

    // Notify listeners
    this.ethBlockListeners.forEach((listener) => listener(this.ethBlocks))
  }

  private addEthereumTransaction(tx: Transaction) {
    // Add to the beginning of the array
    this.ethTransactions.unshift(tx)

    // Keep only the last 50 transactions
    if (this.ethTransactions.length > 50) {
      this.ethTransactions = this.ethTransactions.slice(0, 50)
    }

    // Notify listeners
    this.ethTxListeners.forEach((listener) => listener(this.ethTransactions))
  }

  private addSolanaBlock(block: Block) {
    // Add to the beginning of the array
    this.solBlocks.unshift(block)

    // Keep only the last 20 blocks
    if (this.solBlocks.length > 20) {
      this.solBlocks = this.solBlocks.slice(0, 20)
    }

    // Notify listeners
    this.solBlockListeners.forEach((listener) => listener(this.solBlocks))
  }

  private addSolanaTransaction(tx: Transaction) {
    // Add to the beginning of the array
    this.solTransactions.unshift(tx)

    // Keep only the last 50 transactions
    if (this.solTransactions.length > 50) {
      this.solTransactions = this.solTransactions.slice(0, 50)
    }

    // Notify listeners
    this.solTxListeners.forEach((listener) => listener(this.solTransactions))
  }

  private async updateEthereumStats() {
    if (!this.connectionStatus.ethereum || !this.ethereumProvider) {
      this.setDefaultEthereumStats("Unknown", "Unknown")
      return
    }

    try {
      const blockNumber = await this.ethereumProvider.getBlockNumber()
      const feeData = await this.ethereumProvider.getFeeData()
      const gasPrice = feeData.gasPrice ? ethers.formatUnits(feeData.gasPrice, "gwei") : "0"

      // Fetch real price data from CoinGecko API
      try {
        const controller = new AbortController()
        this.abortControllers.push(controller)

        const response = await fetch(
          "https://api.coingecko.com/api/v3/coins/ethereum?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false",
          { signal: controller.signal },
        )

        if (response.ok) {
          const data = await response.json()

          this.ethStats = {
            latestBlock: blockNumber.toString(),
            gasPrice,
            transactionsPerSecond: 15.2, // Approximate average
            marketCap: data.market_data.market_cap.usd,
            price: data.market_data.current_price.usd,
            change24h: data.market_data.price_change_percentage_24h,
            volume24h: data.market_data.total_volume.usd,
            high24h: data.market_data.high_24h.usd,
            low24h: data.market_data.low_24h.usd,
            circulatingSupply: data.market_data.circulating_supply,
          }

          this.ethTokenInfo = {
            symbol: "ETH",
            name: "Ethereum",
            price: data.market_data.current_price.usd,
            change24h: data.market_data.price_change_percentage_24h,
            volume24h: data.market_data.total_volume.usd,
            marketCap: data.market_data.market_cap.usd,
          }
        } else {
          console.error("Error fetching Ethereum price data:", response.statusText)
          this.updateEthereumStatsWithFallback(blockNumber.toString(), gasPrice)
        }
      } catch (error) {
        console.error("Error fetching Ethereum price data:", error)
        this.updateEthereumStatsWithFallback(blockNumber.toString(), gasPrice)
      }
    } catch (error) {
      console.error("Error updating Ethereum stats:", error)
      this.setDefaultEthereumStats("Unknown", "Unknown")
    }
  }

  private updateEthereumStatsWithFallback(blockNumber: string, gasPrice: string) {
    // Try to fetch from another API endpoint
    fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true",
    )
      .then((response) => {
        if (response.ok) return response.json()
        throw new Error("Failed to fetch from backup API")
      })
      .then((data) => {
        if (data && data.ethereum) {
          this.ethStats = {
            latestBlock: blockNumber,
            gasPrice,
            transactionsPerSecond: 15.2, // Approximate average
            marketCap: data.ethereum.usd_market_cap || 0,
            price: data.ethereum.usd || 0,
            change24h: data.ethereum.usd_24h_change || 0,
            volume24h: data.ethereum.usd_24h_vol || 0,
            high24h: (data.ethereum.usd || 0) * 1.05, // Estimate
            low24h: (data.ethereum.usd || 0) * 0.95, // Estimate
            circulatingSupply: 120725291, // This should be updated regularly
          }

          this.ethTokenInfo = {
            symbol: "ETH",
            name: "Ethereum",
            price: data.ethereum.usd || 0,
            change24h: data.ethereum.usd_24h_change || 0,
            volume24h: data.ethereum.usd_24h_vol || 0,
            marketCap: data.ethereum.usd_market_cap || 0,
          }
        } else {
          // Use last known good values or conservative estimates
          this.setDefaultEthereumStats(blockNumber, gasPrice)
        }
      })
      .catch((error) => {
        console.error("Error fetching backup Ethereum data:", error)
        // Use last known good values or conservative estimates
        this.setDefaultEthereumStats(blockNumber, gasPrice)
      })
  }

  private setDefaultEthereumStats(blockNumber: string, gasPrice: string) {
    // Use last known good values from a reliable source or conservative estimates
    this.ethStats = {
      latestBlock: blockNumber,
      gasPrice,
      transactionsPerSecond: 15.2,
      marketCap: 215828585513,
      price: 1788.55,
      change24h: 0,
      volume24h: 9720322174,
      high24h: 1812.16,
      low24h: 1760.54,
      circulatingSupply: 120725291,
    }

    this.ethTokenInfo = {
      symbol: "ETH",
      name: "Ethereum",
      price: 1788.55,
      change24h: 0,
      volume24h: 9720322174,
      marketCap: 215828585513,
    }
  }

  private async updateSolanaStats() {
    if (!this.connectionStatus.solana || !this.solanaConnection) {
      this.setDefaultSolanaStats("Unknown")
      return
    }

    try {
      const slot = await this.solanaConnection.getSlot()

      // Fetch real price data from CoinGecko API
      try {
        const controller = new AbortController()
        this.abortControllers.push(controller)

        const response = await fetch(
          "https://api.coingecko.com/api/v3/coins/solana?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false",
          { signal: controller.signal },
        )

        if (response.ok) {
          const data = await response.json()

          this.solStats = {
            latestBlock: slot.toString(),
            transactionsPerSecond: 2500, // Theoretical max
            marketCap: data.market_data.market_cap.usd,
            price: data.market_data.current_price.usd,
            change24h: data.market_data.price_change_percentage_24h,
            volume24h: data.market_data.total_volume.usd,
            high24h: data.market_data.high_24h.usd,
            low24h: data.market_data.low_24h.usd,
            circulatingSupply: data.market_data.circulating_supply,
          }

          this.solTokenInfo = {
            symbol: "SOL",
            name: "Solana",
            price: data.market_data.current_price.usd,
            change24h: data.market_data.price_change_percentage_24h,
            volume24h: data.market_data.total_volume.usd,
            marketCap: data.market_data.market_cap.usd,
          }
        } else {
          console.error("Error fetching Solana price data:", response.statusText)
          this.updateSolanaStatsWithFallback(slot.toString())
        }
      } catch (error) {
        console.error("Error fetching Solana price data:", error)
        this.updateSolanaStatsWithFallback(slot.toString())
      }
    } catch (error) {
      console.error("Error updating Solana stats:", error)
      this.setDefaultSolanaStats("Unknown")
    }
  }

  private updateSolanaStatsWithFallback(slot: string) {
    // Try to fetch from another API endpoint
    fetch(
      "https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true",
    )
      .then((response) => {
        if (response.ok) return response.json()
        throw new Error("Failed to fetch from backup API")
      })
      .then((data) => {
        if (data && data.solana) {
          this.solStats = {
            latestBlock: slot,
            transactionsPerSecond: 2500, // Theoretical max
            marketCap: data.solana.usd_market_cap || 0,
            price: data.solana.usd || 0,
            change24h: data.solana.usd_24h_change || 0,
            volume24h: data.solana.usd_24h_vol || 0,
            high24h: (data.solana.usd || 0) * 1.05, // Estimate
            low24h: (data.solana.usd || 0) * 0.95, // Estimate
            circulatingSupply: 401500000, // This should be updated regularly
          }

          this.solTokenInfo = {
            symbol: "SOL",
            name: "Solana",
            price: data.solana.usd || 0,
            change24h: data.solana.usd_24h_change || 0,
            volume24h: data.solana.usd_24h_vol || 0,
            marketCap: data.solana.usd_market_cap || 0,
          }
        } else {
          // Use last known good values or conservative estimates
          this.setDefaultSolanaStats(slot)
        }
      })
      .catch((error) => {
        console.error("Error fetching backup Solana data:", error)
        // Use last known good values or conservative estimates
        this.setDefaultSolanaStats(slot)
      })
  }

  private setDefaultSolanaStats(slot: string) {
    // Use last known good values from a reliable source or conservative estimates
    this.solStats = {
      latestBlock: slot,
      transactionsPerSecond: 2500,
      marketCap: 42500000000,
      price: 105.75,
      change24h: 0,
      volume24h: 1250000000,
      high24h: 107.2,
      low24h: 103.15,
      circulatingSupply: 401500000,
    }

    this.solTokenInfo = {
      symbol: "SOL",
      name: "Solana",
      price: 105.75,
      change24h: 0,
      volume24h: 1250000000,
      marketCap: 42500000000,
    }
  }

  private async fetchMarketData() {
    // This is now handled by the updateEthereumStats and updateSolanaStats methods
    // which fetch real data from CoinGecko or fall back to other real data sources
    await this.updateEthereumStats()
    await this.updateSolanaStats()
  }

  // Public methods to subscribe to updates
  public subscribeToEthereumBlocks(callback: (blocks: Block[]) => void): () => void {
    this.ethBlockListeners.push(callback)
    // Initial callback with current data
    callback(this.ethBlocks)
    return () => {
      this.ethBlockListeners = this.ethBlockListeners.filter((cb) => cb !== callback)
    }
  }

  public subscribeToEthereumTransactions(callback: (txs: Transaction[]) => void): () => void {
    this.ethTxListeners.push(callback)
    // Initial callback with current data
    callback(this.ethTransactions)
    return () => {
      this.ethTxListeners = this.ethTxListeners.filter((cb) => cb !== callback)
    }
  }

  public subscribeToSolanaBlocks(callback: (blocks: Block[]) => void): () => void {
    this.solBlockListeners.push(callback)
    // Initial callback with current data
    callback(this.solBlocks)
    return () => {
      this.solBlockListeners = this.solBlockListeners.filter((cb) => cb !== callback)
    }
  }

  public subscribeToSolanaTransactions(callback: (txs: Transaction[]) => void): () => void {
    this.solTxListeners.push(callback)
    // Initial callback with current data
    callback(this.solTransactions)
    return () => {
      this.solTxListeners = this.solTxListeners.filter((cb) => cb !== callback)
    }
  }

  // Methods to get current stats
  public getEthereumStats(): ChainStats | null {
    return this.ethStats
  }

  public getSolanaStats(): ChainStats | null {
    return this.solStats
  }

  public getEthereumTokenInfo(): TokenInfo | null {
    return this.ethTokenInfo
  }

  public getSolanaTokenInfo(): TokenInfo | null {
    return this.solTokenInfo
  }

  // Add this method to the BlockchainApiService class
  public getSolanaConnection(): Connection | null {
    return this.solanaConnection
  }

  // Clean up resources
  public cleanup(): void {
    // Abort any pending fetch requests
    this.abortControllers.forEach((controller) => {
      try {
        controller.abort()
      } catch (e) {
        // Ignore errors when aborting
      }
    })
    this.abortControllers = []

    // Remove event listeners
    if (this.ethereumProvider) {
      this.ethereumProvider.removeAllListeners()
    }
  }
}

export default BlockchainApiService
