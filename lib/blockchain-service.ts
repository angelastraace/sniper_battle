import { ethers } from "ethers"
import { Connection, PublicKey } from "@solana/web3.js"
import { config } from "./config"
import BlockchainApiService from "./blockchain-api-service"

export interface Transaction {
  hash: string
  from: string
  to: string
  value: string
  timestamp: number
  url: string
}

export class BlockchainService {
  private static instance: BlockchainService
  private ethereumProvider: ethers.JsonRpcProvider | null = null
  private solanaConnection: Connection | null = null
  private bscProvider: ethers.JsonRpcProvider | null = null
  private apiService: BlockchainApiService

  private constructor() {
    this.apiService = BlockchainApiService.getInstance()
    this.initializeProviders()
  }

  private async initializeProviders() {
    try {
      // Get providers from API service
      const connectionStatus = this.apiService.getConnectionStatus()

      if (connectionStatus.ethereum) {
        this.ethereumProvider = new ethers.JsonRpcProvider(
          process.env.ETHEREUM_RPC || config.rpcEndpoints.ethereum || process.env.NEXT_PUBLIC_ALCHEMY_RPC,
        )
      }

      if (connectionStatus.solana) {
        this.solanaConnection = new Connection(
          process.env.SOLANA_RPC || config.rpcEndpoints.solana || "https://api.mainnet-beta.solana.com",
          "confirmed",
        )
      }

      if (connectionStatus.bsc) {
        this.bscProvider = new ethers.JsonRpcProvider(
          process.env.BSC_RPC || config.rpcEndpoints.bsc || "https://bsc-dataseed.binance.org/",
        )
      }
    } catch (error) {
      console.error("Error initializing blockchain providers:", error)
    }
  }

  public static getInstance(): BlockchainService {
    if (!BlockchainService.instance) {
      BlockchainService.instance = new BlockchainService()
    }
    return BlockchainService.instance
  }

  public async getEthereumTransactions(address: string, limit = 10): Promise<Transaction[]> {
    if (!this.ethereumProvider) {
      await this.initializeProviders()
      if (!this.ethereumProvider) {
        console.error("Ethereum provider not available")
        return []
      }
    }

    try {
      // For demonstration, we'll create some sample transactions
      // In a real implementation, you would fetch from Etherscan API or similar
      const blockNumber = await this.ethereumProvider.getBlockNumber()
      const block = await this.ethereumProvider.getBlock(blockNumber)

      if (!block) {
        return []
      }

      const transactions: Transaction[] = []
      const txCount = Math.min(limit, block.transactions.length)

      for (let i = 0; i < txCount; i++) {
        const txHash = block.transactions[i]
        const tx = await this.ethereumProvider.getTransaction(txHash)

        if (tx && (tx.to?.toLowerCase() === address.toLowerCase() || tx.from.toLowerCase() === address.toLowerCase())) {
          transactions.push({
            hash: tx.hash,
            from: tx.from,
            to: tx.to || "Contract Creation",
            value: ethers.formatEther(tx.value),
            timestamp: block.timestamp ? Number(block.timestamp) * 1000 : Date.now(),
            url: `https://etherscan.io/tx/${tx.hash}`,
          })
        }
      }

      return transactions
    } catch (error) {
      console.error("Error fetching Ethereum transactions:", error)
      return []
    }
  }

  public async getSolanaTransactions(address: string, limit = 10): Promise<Transaction[]> {
    if (!this.solanaConnection) {
      await this.initializeProviders()
      if (!this.solanaConnection) {
        console.error("Solana connection not available")
        return []
      }
    }

    try {
      // For demonstration, we'll create some sample transactions
      // In a real implementation, you would fetch from Solana Explorer API or similar
      const publicKey = new PublicKey(address)
      const signatures = await this.solanaConnection.getSignaturesForAddress(publicKey, { limit })

      const transactions: Transaction[] = []

      for (const signatureInfo of signatures) {
        const tx = await this.solanaConnection.getTransaction(signatureInfo.signature)

        if (tx) {
          const accountKeys = tx.transaction.message.accountKeys
          const fromAddress = accountKeys[0].toString()
          const toAddress = accountKeys.length > 1 ? accountKeys[1].toString() : "Unknown"

          transactions.push({
            hash: signatureInfo.signature,
            from: fromAddress,
            to: toAddress,
            value: "N/A", // Would need more processing to get actual value
            timestamp: signatureInfo.blockTime ? signatureInfo.blockTime * 1000 : Date.now(),
            url: `https://solscan.io/tx/${signatureInfo.signature}`,
          })
        }
      }

      return transactions
    } catch (error) {
      console.error("Error fetching Solana transactions:", error)
      return []
    }
  }

  public async getBscTransactions(address: string, limit = 10): Promise<Transaction[]> {
    if (!this.bscProvider) {
      await this.initializeProviders()
      if (!this.bscProvider) {
        console.error("BSC provider not available")
        return []
      }
    }

    try {
      // For demonstration, we'll create some sample transactions
      // In a real implementation, you would fetch from BSCScan API or similar
      const blockNumber = await this.bscProvider.getBlockNumber()
      const block = await this.bscProvider.getBlock(blockNumber)

      if (!block) {
        return []
      }

      const transactions: Transaction[] = []
      const txCount = Math.min(limit, block.transactions.length)

      for (let i = 0; i < txCount; i++) {
        const txHash = block.transactions[i]
        const tx = await this.bscProvider.getTransaction(txHash)

        if (tx && (tx.to?.toLowerCase() === address.toLowerCase() || tx.from.toLowerCase() === address.toLowerCase())) {
          transactions.push({
            hash: tx.hash,
            from: tx.from,
            to: tx.to || "Contract Creation",
            value: ethers.formatEther(tx.value),
            timestamp: block.timestamp ? Number(block.timestamp) * 1000 : Date.now(),
            url: `https://bscscan.com/tx/${tx.hash}`,
          })
        }
      }

      return transactions
    } catch (error) {
      console.error("Error fetching BSC transactions:", error)
      return []
    }
  }
}
