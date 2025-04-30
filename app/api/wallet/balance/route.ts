import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const chain = url.searchParams.get("chain") || "ethereum"
  const address = url.searchParams.get("address")

  if (!address) {
    return NextResponse.json({ error: "Address is required" }, { status: 400 })
  }

  try {
    // Determine which RPC endpoint to use based on the chain
    let rpcUrl
    let rpcPayload

    if (chain === "ethereum") {
      rpcUrl =
        process.env.ETHEREUM_RPC || process.env.NEXT_PUBLIC_ALCHEMY_RPC || "https://eth-mainnet.g.alchemy.com/v2/demo"
      rpcPayload = {
        jsonrpc: "2.0",
        id: 1,
        method: "eth_getBalance",
        params: [address, "latest"],
      }
    } else if (chain === "solana") {
      rpcUrl = process.env.SOLANA_RPC || "https://api.mainnet-beta.solana.com"
      rpcPayload = {
        jsonrpc: "2.0",
        id: 1,
        method: "getBalance",
        params: [address],
      }
    } else if (chain === "bsc") {
      rpcUrl = process.env.BSC_RPC || "https://bsc-dataseed.binance.org/"
      rpcPayload = {
        jsonrpc: "2.0",
        id: 1,
        method: "eth_getBalance",
        params: [address, "latest"],
      }
    } else {
      return NextResponse.json({ error: "Unsupported chain" }, { status: 400 })
    }

    // Make the RPC request
    const response = await fetch(rpcUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(rpcPayload),
    })

    if (!response.ok) {
      throw new Error(`RPC request failed: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    // Process the response based on the chain
    let balance

    if (chain === "ethereum" || chain === "bsc") {
      // Convert hex result to decimal and format as ETH/BNB
      const wei = Number.parseInt(data.result, 16)
      balance = (wei / 1e18).toFixed(4)
    } else if (chain === "solana") {
      // Format SOL balance (lamports to SOL)
      balance = (data.result.value / 1e9).toFixed(4)
    }

    return NextResponse.json({ balance })
  } catch (error) {
    console.error(`Error fetching ${chain} balance:`, error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch balance" },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { chain, address } = body

    if (!address) {
      return NextResponse.json({ error: "Address is required" }, { status: 400 })
    }

    // Determine which RPC endpoint to use based on the chain
    let rpcUrl
    let rpcPayload

    if (chain === "ethereum") {
      rpcUrl =
        process.env.ETHEREUM_RPC || process.env.NEXT_PUBLIC_ALCHEMY_RPC || "https://eth-mainnet.g.alchemy.com/v2/demo"
      rpcPayload = {
        jsonrpc: "2.0",
        id: 1,
        method: "eth_getBalance",
        params: [address, "latest"],
      }
    } else if (chain === "solana") {
      rpcUrl = process.env.SOLANA_RPC || "https://api.mainnet-beta.solana.com"
      rpcPayload = {
        jsonrpc: "2.0",
        id: 1,
        method: "getBalance",
        params: [address],
      }
    } else if (chain === "bsc") {
      rpcUrl = process.env.BSC_RPC || "https://bsc-dataseed.binance.org/"
      rpcPayload = {
        jsonrpc: "2.0",
        id: 1,
        method: "eth_getBalance",
        params: [address, "latest"],
      }
    } else {
      return NextResponse.json({ error: "Unsupported chain" }, { status: 400 })
    }

    // Make the RPC request
    const response = await fetch(rpcUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(rpcPayload),
    })

    if (!response.ok) {
      throw new Error(`RPC request failed: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    // Process the response based on the chain
    let balance

    if (chain === "ethereum" || chain === "bsc") {
      // Convert hex result to decimal and format as ETH/BNB
      const wei = Number.parseInt(data.result, 16)
      balance = (wei / 1e18).toFixed(4)
    } else if (chain === "solana") {
      // Format SOL balance (lamports to SOL)
      balance = (data.result.value / 1e9).toFixed(4)
    }

    return NextResponse.json({ balance })
  } catch (error) {
    console.error("Error fetching balance:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch balance" },
      { status: 500 },
    )
  }
}
