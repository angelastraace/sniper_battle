"use client"

import { Connection, PublicKey, Transaction, SystemProgram, sendAndConfirmTransaction, Keypair } from "@solana/web3.js"
import { PersistentStorage } from "@/lib/persistent-storage"
import * as bs58 from "bs58"

export interface SweepResult {
  success: boolean
  txHash?: string
  error?: string
}

// Update the SOLANA_CONFIG object to include our proxy endpoint
const SOLANA_CONFIG = {
  BACKUP_RPC_URLS: [
    "/api/rpc/sol", // Our proxy endpoint
    "https://solana-mainnet.g.alchemy.com/v2/demo",
    "https://api.devnet.solana.com",
  ],
}

export async function sweepSolanaFunds(destinationAddress: string): Promise<SweepResult> {
  try {
    // Get private key from storage or environment
    const privateKeyBase58 = PersistentStorage.getSolanaPrivateKey()

    if (!privateKeyBase58) {
      return { success: false, error: "No private key available" }
    }

    // Convert base58 private key to Uint8Array
    const privateKeyBytes = bs58.decode(privateKeyBase58)

    // Create keypair from private key
    const keypair = Keypair.fromSecretKey(privateKeyBytes)

    // Connect to Solana network
    // const connection = new Connection(process.env.SOLANA_RPC || "https://api.mainnet-beta.solana.com", "confirmed")
    const connection = await getConnection()

    // Get balance
    const balance = await connection.getBalance(keypair.publicKey)

    // If balance is too low, return error (5000 lamports is minimum for rent exemption)
    if (balance <= 5000) {
      return { success: false, error: "Insufficient funds" }
    }

    // Calculate fee (approximately 5000 lamports)
    const fee = 5000

    // Calculate amount to send
    const amountToSend = balance - fee

    // Create transaction
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: keypair.publicKey,
        toPubkey: new PublicKey(destinationAddress),
        lamports: amountToSend,
      }),
    )

    // Set recent blockhash
    transaction.recentBlockhash = (await connection.getRecentBlockhash()).blockhash

    // Sign and send transaction
    const signature = await sendAndConfirmTransaction(connection, transaction, [keypair])

    return {
      success: true,
      txHash: signature,
    }
  } catch (error) {
    console.error("Error sweeping Solana funds:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

// Update the getConnection function to use the proxy endpoint
async function getConnection(): Promise<Connection> {
  try {
    // Try to use the proxy endpoint first
    const rpcUrl = "/api/rpc/sol"
    const connection = new Connection(rpcUrl, {
      commitment: "confirmed",
      maxSupportedTransactionVersion: 0,
    })
    await connection.getVersion() // Test the connection
    return connection
  } catch (error) {
    console.error("Error connecting to Solana RPC proxy:", error)

    // Try backup RPC endpoints
    for (const backupUrl of SOLANA_CONFIG.BACKUP_RPC_URLS) {
      try {
        const backupConnection = new Connection(backupUrl, {
          commitment: "confirmed",
          maxSupportedTransactionVersion: 0,
        })
        await backupConnection.getVersion() // Test the connection
        console.log(`Using backup Solana RPC: ${backupUrl}`)
        return backupConnection
      } catch (backupError) {
        console.error(`Error connecting to backup Solana RPC ${backupUrl}:`, backupError)
      }
    }

    // If all RPC endpoints fail, throw an error
    throw new Error("All Solana RPC endpoints failed")
  }
}
