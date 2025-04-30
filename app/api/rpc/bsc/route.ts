import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Get the BSC RPC URL from environment variables
    const BSC_RPC = process.env.BSC_RPC || "https://bsc-dataseed.binance.org/"

    // Forward the request to the RPC endpoint
    const response = await fetch(BSC_RPC, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    // Get the response data
    const data = await response.json()

    // Log the request (optional)
    console.log(`🔄 Proxied BSC RPC: ${body.method}`)

    // Return the response
    return NextResponse.json(data)
  } catch (error) {
    console.error("BSC RPC Proxy Error:", error)
    return NextResponse.json({ error: "RPC request failed" }, { status: 500 })
  }
}
