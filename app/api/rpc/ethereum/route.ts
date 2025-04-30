import { type NextRequest, NextResponse } from "next/server"

// Handle both GET and POST requests
export async function GET(request: NextRequest) {
  return handleRequest(request)
}

export async function POST(request: NextRequest) {
  return handleRequest(request)
}

async function handleRequest(request: NextRequest) {
  try {
    // Get RPC URL from environment variables with fallbacks
    const rpcUrl =
      process.env.ETHEREUM_RPC || process.env.NEXT_PUBLIC_ALCHEMY_RPC || "https://eth-mainnet.g.alchemy.com/v2/demo"

    // For GET requests, we need to extract query parameters
    let body
    if (request.method === "GET") {
      const url = new URL(request.url)
      const method = url.searchParams.get("method") || "eth_blockNumber"
      const params = url.searchParams.get("params") ? JSON.parse(url.searchParams.get("params") || "[]") : []

      body = {
        jsonrpc: "2.0",
        id: 1,
        method,
        params,
      }
    } else {
      // For POST requests, parse the JSON body
      try {
        body = await request.json()
      } catch (error) {
        console.error("Invalid JSON in request body:", error)
        return NextResponse.json(
          { jsonrpc: "2.0", error: { code: -32700, message: "Parse error" }, id: null },
          { status: 400 },
        )
      }
    }

    // Log the request (optional)
    console.log(`Ethereum RPC request: ${body.method || "unknown method"}`)

    // Forward the request to the RPC endpoint
    const response = await fetch(rpcUrl, {
      method: "POST", // Always use POST for the actual RPC call
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      console.error(`Ethereum RPC error: ${response.status} ${response.statusText}`)
      return NextResponse.json(
        {
          jsonrpc: "2.0",
          error: {
            code: -32603,
            message: `Provider error: ${response.status} ${response.statusText}`,
          },
          id: body.id || null,
        },
        { status: 502 },
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Ethereum RPC proxy error:", error)
    return NextResponse.json(
      { jsonrpc: "2.0", error: { code: -32603, message: "Internal JSON-RPC error" }, id: null },
      { status: 500 },
    )
  }
}
