import { NextResponse } from "next/server"
import { ethers } from "ethers"

export async function GET() {
  try {
    // Use the environment variable for RPC URL, with a reliable mainnet fallback
    const rpcUrl = process.env.ETHEREUM_RPC || "https://eth-mainnet.g.alchemy.com/v2/demo"

    // Create provider with mainnet
    const provider = new ethers.JsonRpcProvider(rpcUrl)

    // Get current block number
    const blockNumber = await provider.getBlockNumber()

    // Get gas price
    const feeData = await provider.getFeeData()
    const gasPrice = feeData.gasPrice ? ethers.formatUnits(feeData.gasPrice, "gwei") : "unknown"

    // Get latest block
    const latestBlock = await provider.getBlock("latest")

    return NextResponse.json({
      status: "online",
      network: "mainnet",
      blockNumber,
      gasPrice,
      timestamp: new Date().toISOString(),
      latestBlockTimestamp: latestBlock ? new Date(Number(latestBlock.timestamp) * 1000).toISOString() : null,
    })
  } catch (error) {
    console.error("Error fetching Ethereum status:", error)
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to fetch Ethereum network status",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
