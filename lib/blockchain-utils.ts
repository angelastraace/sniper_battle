import { ethers } from "ethers"
import { Connection, PublicKey } from "@solana/web3.js"
import { config } from "./config"

// Function to get blockchain status
export async function getBlockchainStatus() {
  const timestamp = new Date().toISOString()

  try {
    // Ethereum status
    const ethereumProvider = new ethers.providers.JsonRpcProvider(config.rpcEndpoints.ethereum)
    const ethBlockNumber = await ethereumProvider.getBlockNumber()
    const ethGasPrice = await ethereumProvider.getGasPrice()

    // Solana status
    const solanaConnection = new Connection(config.rpcEndpoints.solana)
    const solSlot = await solanaConnection.getSlot()

    // BSC status
    const bscProvider = new ethers.providers.JsonRpcProvider(config.rpcEndpoints.bsc)
    const bscBlockNumber = await bscProvider.getBlockNumber()
    const bscGasPrice = await bscProvider.getGasPrice()

    return {
      ethereum: {
        status: "online",
        blockNumber: ethBlockNumber,
        gasPrice: ethers.utils.formatUnits(ethGasPrice, "gwei"),
        network: "mainnet",
        latency: "low",
      },
      solana: {
        status: "online",
        slot: solSlot,
        blockTime: Math.floor(Date.now() / 1000),
        version: "1.14.17",
        latency: "low",
      },
      bsc: {
        status: "online",
        blockNumber: bscBlockNumber,
        gasPrice: ethers.utils.formatUnits(bscGasPrice, "gwei"),
        network: "mainnet",
        latency: "low",
      },
      timestamp,
    }
  } catch (error) {
    console.error("Error fetching blockchain status:", error)

    // Return fallback data
    return {
      ethereum: {
        status: "offline",
        blockNumber: 0,
        gasPrice: "0",
        network: "unknown",
        latency: "high",
      },
      solana: {
        status: "offline",
        slot: 0,
        blockTime: Math.floor(Date.now() / 1000),
        version: "unknown",
        latency: "high",
      },
      bsc: {
        status: "offline",
        blockNumber: 0,
        gasPrice: "0",
        network: "unknown",
        latency: "high",
      },
      timestamp,
    }
  }
}

// Function to get Solana signatures
export async function getSolanaSignatures(address: string, limit = 5) {
  try {
    const connection = new Connection(config.rpcEndpoints.solana)
    const publicKey = new PublicKey(address)

    const signatures = await connection.getSignaturesForAddress(publicKey, { limit })
    return signatures
  } catch (error) {
    console.error("Error fetching Solana signatures:", error)
    return []
  }
}

// Function to get Ethereum transactions
export async function getEthereumTransactions(address: string, limit = 5) {
  try {
    const provider = new ethers.providers.JsonRpcProvider(config.rpcEndpoints.ethereum)
    const currentBlock = await provider.getBlockNumber()

    // For simplicity, we'll just get the latest block and filter transactions
    // In a real app, you'd use an API like Etherscan for this
    const block = await provider.getBlock(currentBlock, true)

    // Filter transactions involving the address
    const transactions = block.transactions
      .filter(
        (tx) => tx.from?.toLowerCase() === address.toLowerCase() || tx.to?.toLowerCase() === address.toLowerCase(),
      )
      .slice(0, limit)

    return transactions
  } catch (error) {
    console.error("Error fetching Ethereum transactions:", error)
    return []
  }
}

// Function to get BSC transactions
export async function getBSCTransactions(address: string, limit = 5) {
  try {
    const provider = new ethers.providers.JsonRpcProvider(config.rpcEndpoints.bsc)
    const currentBlock = await provider.getBlockNumber()

    // For simplicity, we'll just get the latest block and filter transactions
    const block = await provider.getBlock(currentBlock, true)

    // Filter transactions involving the address
    const transactions = block.transactions
      .filter(
        (tx) => tx.from?.toLowerCase() === address.toLowerCase() || tx.to?.toLowerCase() === address.toLowerCase(),
      )
      .slice(0, limit)

    return transactions
  } catch (error) {
    console.error("Error fetching BSC transactions:", error)
    return []
  }
}
