import { NextResponse } from "next/server"
import { Connection, PublicKey } from "@solana/web3.js"

export async function POST(request: Request) {
  try {
    const { address } = await request.json()

    if (!address) {
      return NextResponse.json({ error: "Address is required" }, { status: 400 })
    }

    const SOLANA_RPC = process.env.SOLANA_RPC || "https://api.mainnet-beta.solana.com"
    const connection = new Connection(SOLANA_RPC, "confirmed")

    // Get recent transactions (signatures)
    const signatures = await connection.getSignaturesForAddress(new PublicKey(address), { limit: 10 })

    // Get transaction details
    const transactions = await Promise.all(
      signatures.map(async (sig) => {
        try {
          const tx = await connection.getTransaction(sig.signature, {
            maxSupportedTransactionVersion: 0,
          })

          return {
            signature: sig.signature,
            timestamp: sig.blockTime ? new Date(sig.blockTime * 1000).toISOString() : null,
            status: sig.err ? "failed" : "success",
            fee: tx?.meta?.fee || 0,
            blockTime: sig.blockTime,
            type: getTransactionType(tx),
            amount: getTransactionAmount(tx, address),
          }
        } catch (error) {
          console.error(`Error fetching transaction ${sig.signature}:`, error)
          return {
            signature: sig.signature,
            timestamp: sig.blockTime ? new Date(sig.blockTime * 1000).toISOString() : null,
            status: "unknown",
            error: "Failed to fetch transaction details",
          }
        }
      }),
    )

    return NextResponse.json({ transactions })
  } catch (error) {
    console.error("Error fetching Solana transactions:", error)
    return NextResponse.json({ error: "Failed to fetch transactions", details: error.message }, { status: 500 })
  }
}

// Helper function to determine transaction type
function getTransactionType(tx: any): string {
  if (!tx) return "unknown"

  // This is a simplified version - you can expand this to detect more types
  if (tx.meta?.logMessages?.some((msg: string) => msg.includes("Transfer"))) {
    return "transfer"
  }
  if (tx.meta?.logMessages?.some((msg: string) => msg.includes("Swap"))) {
    return "swap"
  }
  return "other"
}

// Helper function to estimate transaction amount (simplified)
function getTransactionAmount(tx: any, address: string): number | null {
  if (!tx || !tx.meta) return null

  // This is a simplified version - for accurate amounts you'd need to parse the transaction data
  // based on the specific program that processed it
  const preBalances = tx.meta.preBalances || []
  const postBalances = tx.meta.postBalances || []

  if (preBalances.length > 0 && postBalances.length > 0) {
    // Very simplified - just looking at the first account's balance change
    return (postBalances[0] - preBalances[0]) / 1e9
  }

  return null
}
