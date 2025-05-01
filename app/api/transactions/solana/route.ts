import { NextResponse } from "next/server"
import { Connection, PublicKey } from "@solana/web3.js"
import { SOLANA_CONFIG } from "@/app/config/solana"

export async function POST(request: Request) {
  try {
    const { address } = await request.json()

    if (!address) {
      return NextResponse.json({ error: "Address is required" }, { status: 400 })
    }

    console.log(`Fetching Solana transactions for address: ${address}`)

    // Use the proxy endpoint from config
    const rpcUrl = SOLANA_CONFIG.RPC_URL
    console.log(`Using Solana RPC URL: ${rpcUrl}`)

    const connection = new Connection(rpcUrl, {
      commitment: "confirmed",
      maxSupportedTransactionVersion: 0,
    })

    try {
      const publicKey = new PublicKey(address)

      // Get recent signatures for the address
      const signatures = await connection.getSignaturesForAddress(publicKey, { limit: 10 })
      console.log(`Found ${signatures.length} signatures for ${address}`)

      // Map signatures to transaction objects
      const transactions = signatures.map((sig) => {
        return {
          signature: sig.signature,
          timestamp: sig.blockTime ? new Date(sig.blockTime * 1000).toISOString() : null,
          status: sig.err ? "failed" : "success",
          blockTime: sig.blockTime,
          type: determineTransactionType(sig),
          amount: calculateTransactionAmount(sig),
        }
      })

      return NextResponse.json({ transactions })
    } catch (error) {
      console.error("Error fetching Solana transactions:", error)
      return NextResponse.json(
        { error: "Failed to fetch transactions", details: error instanceof Error ? error.message : String(error) },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error processing request:", error)
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}

// Helper function to determine transaction type
function determineTransactionType(signatureInfo: any): string {
  // This is a simplified version - in a real app, you'd analyze the transaction data
  if (signatureInfo.memo && signatureInfo.memo.includes("swap")) {
    return "Swap"
  } else if (signatureInfo.memo && signatureInfo.memo.includes("stake")) {
    return "Stake"
  } else {
    return "Transfer"
  }
}

// Helper function to calculate transaction amount
function calculateTransactionAmount(signatureInfo: any): number | null {
  // This is a placeholder - in a real app, you'd calculate based on transaction data
  // For demo purposes, we'll generate random amounts
  const types = {
    Transfer: () => Math.random() * 0.5,
    Swap: () => -Math.random() * 0.5,
    Stake: () => Math.random() * 2,
  }

  const type = determineTransactionType(signatureInfo)
  return Number.parseFloat((types[type as keyof typeof types]?.() || 0).toFixed(2))
}
