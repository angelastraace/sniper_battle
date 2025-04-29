import { NextResponse } from "next/server"
import { Connection, PublicKey } from "@solana/web3.js"
import { SOLANA_CONFIG } from "../../../../config/solana"

// Mock data has been completely removed
// This endpoint now provides real Solana signatures when the primary RPC fails

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const action = searchParams.get("action")

  try {
    // Use a reliable mainnet RPC endpoint
    const rpcUrl = process.env.SOLANA_RPC || "https://api.mainnet-beta.solana.com"
    const connection = new Connection(rpcUrl)

    if (action === "getSignaturesForAddress") {
      const address = searchParams.get("address")
      if (!address) {
        return NextResponse.json({ error: "Address parameter is required" }, { status: 400 })
      }

      try {
        const pubkey = new PublicKey(address)
        const signatures = await connection.getSignaturesForAddress(pubkey, { limit: 10 })

        return NextResponse.json({
          success: true,
          data: signatures,
        })
      } catch (error) {
        console.error("Error fetching signatures:", error)

        // Try with a different mainnet RPC if the first one fails
        try {
          const backupConnection = new Connection(SOLANA_CONFIG.BACKUP_RPC_URLS[0])
          const pubkey = new PublicKey(address)
          const signatures = await backupConnection.getSignaturesForAddress(pubkey, { limit: 10 })

          return NextResponse.json({
            success: true,
            data: signatures,
          })
        } catch (backupError) {
          console.error("Backup RPC also failed:", backupError)
          return NextResponse.json(
            {
              success: false,
              error: "Failed to fetch signatures from all RPC endpoints",
            },
            { status: 500 },
          )
        }
      }
    } else if (action === "getAccountInfo") {
      const address = searchParams.get("address")
      if (!address) {
        return NextResponse.json({ error: "Address parameter is required" }, { status: 400 })
      }

      try {
        const pubkey = new PublicKey(address)
        const accountInfo = await connection.getAccountInfo(pubkey)

        return NextResponse.json({
          success: true,
          data: {
            executable: accountInfo?.executable,
            owner: accountInfo?.owner.toString(),
            lamports: accountInfo?.lamports,
            data: accountInfo?.data.toString("base64"),
            rentEpoch: accountInfo?.rentEpoch,
          },
        })
      } catch (error) {
        console.error("Error fetching account info:", error)

        // Try with a different mainnet RPC if the first one fails
        try {
          const backupConnection = new Connection(SOLANA_CONFIG.BACKUP_RPC_URLS[0])
          const pubkey = new PublicKey(address)
          const accountInfo = await backupConnection.getAccountInfo(pubkey)

          return NextResponse.json({
            success: true,
            data: {
              executable: accountInfo?.executable,
              owner: accountInfo?.owner.toString(),
              lamports: accountInfo?.lamports,
              data: accountInfo?.data.toString("base64"),
              rentEpoch: accountInfo?.rentEpoch,
            },
          })
        } catch (backupError) {
          console.error("Backup RPC also failed:", backupError)
          return NextResponse.json(
            {
              success: false,
              error: "Failed to fetch account info from all RPC endpoints",
            },
            { status: 500 },
          )
        }
      }
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error in Solana fallback API:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 },
    )
  }
}
