import { type NextRequest, NextResponse } from "next/server"
import { Network, Alchemy } from "alchemy-sdk"

// Initialize Alchemy with server-side environment variables
const getAlchemyInstance = () => {
  const apiKey = process.env.ETHEREUM_RPC?.includes("alchemy")
    ? process.env.ETHEREUM_RPC.split("/").pop()
    : process.env.NEXT_PUBLIC_ALCHEMY_RPC?.split("/").pop() || "demo"

  return new Alchemy({
    apiKey,
    network: Network.ETH_MAINNET,
  })
}

export async function POST(request: NextRequest) {
  try {
    const { method, params } = await request.json()
    const alchemy = getAlchemyInstance()

    // Make sure the method exists on alchemy.core
    if (!alchemy.core[method] || typeof alchemy.core[method] !== "function") {
      return NextResponse.json({ error: `Method ${method} not found on Alchemy SDK` }, { status: 400 })
    }

    // Call the requested method with provided parameters
    const result = await alchemy.core[method](...(params || []))

    // Log the request (optional)
    console.log(`Alchemy SDK request: ${method}`)

    return NextResponse.json({ result })
  } catch (error) {
    console.error("Alchemy SDK proxy error:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
