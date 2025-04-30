import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    // Get RPC URL from environment variables with fallbacks
    const rpcUrl =
      process.env.ETHEREUM_RPC || process.env.NEXT_PUBLIC_ALCHEMY_RPC || "https://eth-mainnet.g.alchemy.com/v2/demo"

    if (!rpcUrl) {
      console.error("No Ethereum RPC endpoint configured")
      return NextResponse.json(
        { jsonrpc: "2.0", error: { code: -32603, message: "RPC endpoint not configured" }, id: null },
        { status: 500 },
      )
    }

    // Parse the request body
    let body
    try {
      body = await request.json()
    } catch (error) {
      console.error("Invalid JSON in request body:", error)
      return NextResponse.json(
        { jsonrpc: "2.0", error: { code: -32700, message: "Parse error" }, id: null },
        { status: 400 },
      )
    }

    // Log the request (optional)
    console.log(`Ethereum RPC request: ${body.method || "unknown method"}`)

    // Forward the request to the RPC endpoint with timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

    try {
      const response = await fetch(rpcUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

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
      clearTimeout(timeoutId)
      console.error("Ethereum RPC fetch error:", error)

      // Handle abort errors specifically
      if (error.name === "AbortError") {
        return NextResponse.json(
          { jsonrpc: "2.0", error: { code: -32603, message: "Request timeout" }, id: body?.id || null },
          { status: 504 },
        )
      }

      return NextResponse.json(
        { jsonrpc: "2.0", error: { code: -32603, message: "Internal JSON-RPC error" }, id: body?.id || null },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Ethereum RPC proxy error:", error)
    return NextResponse.json(
      { jsonrpc: "2.0", error: { code: -32603, message: "Internal JSON-RPC error" }, id: null },
      { status: 500 },
    )
  }
}
