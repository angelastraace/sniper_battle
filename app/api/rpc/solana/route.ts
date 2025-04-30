import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    // Get Helius API key from environment variables
    const HELIUS_API_KEY = process.env.HELIUS_API_KEY || ""

    // Use Helius if available, otherwise fall back to public RPC
    const rpcUrl = HELIUS_API_KEY
      ? `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`
      : "https://api.mainnet-beta.solana.com"

    console.log(`Using Solana RPC: ${HELIUS_API_KEY ? "Helius (with API key)" : "Public endpoint"}`)

    // Parse the request body
    const body = await request.json()

    // Log the request method
    console.log(`Solana RPC request: ${body.method}`)

    // Forward the request to Solana RPC
    const response = await fetch(rpcUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    // Check if the response is successful
    if (!response.ok) {
      console.error(`Solana RPC error: ${response.status} ${response.statusText}`)
      return NextResponse.json(
        {
          jsonrpc: "2.0",
          id: body.id || null,
          error: {
            code: -32603,
            message: `Provider error: ${response.status} ${response.statusText}`,
          },
        },
        { status: 502 },
      )
    }

    // Parse and return the response
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Solana RPC proxy error:", error)
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        id: null,
        error: {
          code: -32603,
          message: error instanceof Error ? error.message : "Internal error",
        },
      },
      { status: 500 },
    )
  }
}

// Also handle GET requests for health checks
export async function GET() {
  return NextResponse.json({ status: "ok", service: "solana-rpc-proxy" })
}
