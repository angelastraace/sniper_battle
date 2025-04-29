import { PublicKey } from "@solana/web3.js"

// Check if a string is a valid Solana public key
export function isValidPublicKey(address: string): boolean {
  try {
    new PublicKey(address)
    return true
  } catch (error) {
    return false
  }
}

// Format a public key for display
export function formatPublicKey(publicKey: string): string {
  if (!publicKey) return ""
  return `${publicKey.slice(0, 4)}...${publicKey.slice(-4)}`
}

// Format SOL amount
export function formatSol(lamports: number): string {
  return (lamports / 1e9).toFixed(9)
}
