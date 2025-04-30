import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    // Get API key from environment variables with fallback
    const ALCHEMY_API_KEY =
      process.env.ALCHEMY_API_KEY || process.env.NEXT_PUBLIC_ALCHEMY_RPC?.split("/v2/")?.pop() || "demo"

    // Log the API key (first 4 chars only for security)
    console.log(`Using Alchemy API key: ${ALCHEMY_API_KEY.substring(0, 4)}...`)

    // Parse the request body
    const body = await request.json()

    // Log the request method
    console.log(`Ethereum RPC request: ${body.method}`)

    // Forward the request to Alchemy
    const response = await fetch(`https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    // Check if the response is successful
    if (!response.ok) {
      console.error(`Alchemy API error: ${response.status} ${response.statusText}`)
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
    console.error("Ethereum RPC proxy error:", error)
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
  return NextResponse.json({ status: "ok", service: "ethereum-rpc-proxy" })
}
