import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const rpcUrl = process.env.SOLANA_RPC

    if (!rpcUrl) {
      console.error("SOLANA_RPC environment variable not set")
      return NextResponse.json({ error: "RPC endpoint not configured" }, { status: 500 })
    }

    const body = await request.json()
    console.log(`Solana RPC request: ${body.method}`)

    const response = await fetch(rpcUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      console.error(`Solana RPC error: ${response.status} ${response.statusText}`)
      return NextResponse.json({ error: "RPC request failed" }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Solana RPC proxy error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
