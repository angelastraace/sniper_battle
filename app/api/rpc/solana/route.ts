import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Get the Solana RPC URL from environment variables
    const SOLANA_RPC = process.env.NEXT_PUBLIC_SOLANA_RPC || "https://api.mainnet-beta.solana.com"

    // Forward the request to the RPC endpoint
    const response = await fetch(SOLANA_RPC, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    // Get the response data
    const data = await response.json()

    // Log the request (optional)
    console.log(`🔄 Proxied SOL RPC: ${body.method}`)

    // Return the response
    return NextResponse.json(data)
  } catch (error) {
    console.error("SOL RPC Proxy Error:", error)
    return NextResponse.json({ error: "RPC request failed" }, { status: 500 })
  }
}
