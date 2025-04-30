import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Get the Alchemy API key from environment variables
    const ALCHEMY_KEY = process.env.NEXT_PUBLIC_ALCHEMY_RPC?.split("/").pop() || process.env.INFURA_PROJECT_ID || "demo" // Fallback, should be replaced with actual key

    // Construct the RPC URL
    const rpcUrl = `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_KEY}`

    // Forward the request to the RPC endpoint
    const response = await fetch(rpcUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    // Get the response data
    const data = await response.json()

    // Log the request (optional)
    console.log(`🔄 Proxied ETH RPC: ${body.method}`)

    // Return the response
    return NextResponse.json(data)
  } catch (error) {
    console.error("ETH RPC Proxy Error:", error)
    return NextResponse.json({ error: "RPC request failed" }, { status: 500 })
  }
}
