import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const ALCHEMY_API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_RPC?.split("/").pop() || process.env.ALCHEMY_API_KEY || "demo" // Fallback, should be replaced with actual key

  try {
    const body = await request.json()

    const response = await fetch(`https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Proxy error:", error)
    return NextResponse.json({ error: "Proxy failed", details: error.message }, { status: 500 })
  }
}
