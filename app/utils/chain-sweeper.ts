"use client"

import { ethers } from "ethers"
import { PersistentStorage } from "@/lib/persistent-storage"

export interface SweepResult {
  success: boolean
  txHash?: string
  error?: string
}

const ETHEREUM_CONFIG = {
  BACKUP_RPC_URLS: [
    process.env.NEXT_PUBLIC_ALCHEMY_RPC || "https://eth-mainnet.alchemyapi.io/v2/demo",
    "https://cloudflare-eth.com",
  ],
}

const BSC_CONFIG = {
  BACKUP_RPC_URLS: ["https://bsc-dataseed.binance.org/", "https://bsc-dataseed1.binance.org/"],
}

class ChainSweeper {
  private chainName: string
  private rpcUrl: string
  private privateKey: string | null

  constructor(chainName: string, rpcUrl: string | undefined, privateKey: string | null | undefined) {
    this.chainName = chainName
    this.rpcUrl = rpcUrl || ""
    this.privateKey = privateKey || null
  }

  private getProvider(): ethers.JsonRpcProvider {
    try {
      // Try to use the primary RPC endpoint
      const provider = new ethers.JsonRpcProvider(this.rpcUrl)
      return provider
    } catch (error) {
      console.error(`Error connecting to primary ${this.chainName} RPC:`, error)

      // Try backup RPC endpoints
      const backupUrls = this.chainName === "Ethereum" ? ETHEREUM_CONFIG.BACKUP_RPC_URLS : BSC_CONFIG.BACKUP_RPC_URLS

      for (const backupUrl of backupUrls) {
        try {
          const backupProvider = new ethers.JsonRpcProvider(backupUrl)
          console.log(`Using backup ${this.chainName} RPC: ${backupUrl}`)
          return backupProvider
        } catch (backupError) {
          console.error(`Error connecting to backup ${this.chainName} RPC ${backupUrl}:`, backupError)
        }
      }

      // If all RPC endpoints fail, throw an error
      throw new Error(`All ${this.chainName} RPC endpoints failed`)
    }
  }

  async sweepFunds(destinationAddress: string): Promise<SweepResult> {
    try {
      if (!this.privateKey) {
        return { success: false, error: "No private key available" }
      }

      // Create wallet from private key
      const wallet = new ethers.Wallet(this.privateKey)

      // Connect wallet to provider
      const provider = this.getProvider()
      const connectedWallet = wallet.connect(provider)

      // Get balance
      const balance = await provider.getBalance(wallet.address)

      // If balance is too low, return error
      if (balance <= ethers.parseEther("0.001")) {
        return { success: false, error: "Insufficient funds to cover gas" }
      }

      // Estimate gas price
      const feeData = await provider.getFeeData()
      const gasPrice = feeData.gasPrice || ethers.parseUnits(this.chainName === "Ethereum" ? "50" : "5", "gwei")

      // Estimate gas limit for a simple transfer
      const gasLimit = 21000

      // Calculate max amount to send (balance - gas cost)
      const gasCost = gasPrice * BigInt(gasLimit)
      const amountToSend = balance - gasCost

      // Create transaction
      const tx = {
        to: destinationAddress,
        value: amountToSend,
        gasLimit: gasLimit,
        gasPrice: gasPrice,
      }

      // Send transaction
      const transaction = await connectedWallet.sendTransaction(tx)

      // Wait for transaction to be mined
      const receipt = await transaction.wait()

      return {
        success: true,
        txHash: receipt?.hash || transaction.hash,
      }
    } catch (error) {
      console.error(`Error sweeping ${this.chainName} funds:`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }
}

export async function sweepEthereumFunds(destinationAddress: string): Promise<SweepResult> {
  const privateKey = process.env.ETHEREUM_PRIVATE_KEY || PersistentStorage.getEthereumPrivateKey()
  const ethereumSweeper = new ChainSweeper("Ethereum", process.env.ETHEREUM_RPC, privateKey)
  return ethereumSweeper.sweepFunds(destinationAddress)
}

export async function sweepBscFunds(destinationAddress: string): Promise<SweepResult> {
  const privateKey = process.env.BSC_PRIVATE_KEY || PersistentStorage.getBscPrivateKey()
  const bscSweeper = new ChainSweeper("BSC", process.env.BSC_RPC, privateKey)
  return bscSweeper.sweepFunds(destinationAddress)
}
