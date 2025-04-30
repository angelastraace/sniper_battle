import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const SOLANA_RPC = process.env.SOLANA_RPC || "https://api.mainnet-beta.solana.com"

  try {
    const body = await request.json()

    const response = await fetch(SOLANA_RPC, {
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
