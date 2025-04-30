import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    // Get the RPC endpoint from environment variables with fallback
    const rpcUrl = process.env.SOLANA_RPC || "https://api.mainnet-beta.solana.com"

    // Get the request body
    const body = await request.json()

    // Log the request (optional)
    console.log(`Solana RPC request: ${body.method}`)

    // Forward the request to the actual RPC endpoint
    const response = await fetch(rpcUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    // Get the response data
    const data = await response.json()

    // Return the response
    return NextResponse.json(data)
  } catch (error) {
    console.error("Solana RPC proxy error:", error)
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        id: null,
        error: {
          code: -32603,
          message: "Internal JSON-RPC error",
          data: { message: error.message },
        },
      },
      { status: 500 },
    )
  }
}
