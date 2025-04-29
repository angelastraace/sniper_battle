import { NextResponse } from "next/server"
import { getConnectionWithFallback } from "../../../../utils/solana/rpc-fallback"

export async function GET() {
  try {
    // Use the fallback-enabled connection to ensure we're always using a working mainnet node
    const connection = getConnectionWithFallback()

    // Get current slot
    const slot = await connection.getSlot()

    // Get recent performance samples
    const perfSamples = await connection.getRecentPerformanceSamples(5)

    // Calculate average TPS
    const avgTps =
      perfSamples.length > 0
        ? perfSamples.reduce((sum, sample) => sum + sample.numTransactions / sample.samplePeriodSecs, 0) /
          perfSamples.length
        : 0

    return NextResponse.json({
      status: "online",
      network: "mainnet-beta",
      slot,
      tps: avgTps.toFixed(2),
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error fetching Solana status:", error)
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to fetch Solana network status",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
