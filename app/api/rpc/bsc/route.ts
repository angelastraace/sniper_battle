import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    // Get BSC RPC URL from environment variables with fallback
    const BSC_RPC = process.env.BSC_RPC || "https://bsc-dataseed.binance.org"

    // Parse the request body
    const body = await request.json()

    // Log the request method
    console.log(`BSC RPC request: ${body.method}`)

    // Forward the request to BSC RPC
    const response = await fetch(BSC_RPC, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    // Check if the response is successful
    if (!response.ok) {
      console.error(`BSC RPC error: ${response.status} ${response.statusText}`)
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
    console.error("BSC RPC proxy error:", error)
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
  return NextResponse.json({ status: "ok", service: "bsc-rpc-proxy" })
}
