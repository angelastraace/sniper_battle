import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { address } = await request.json()

    if (!address) {
      return NextResponse.json({ error: "Address is required" }, { status: 400 })
    }

    // For now, return mock data
    const mockTransactions = [
      {
        signature: "0x5d53558791c9346d644d077354420f9a93600acf54910486764bc219877329c7",
        timestamp: new Date().toISOString(),
        status: "success",
        type: "Transfer",
        amount: 0.1,
        blockTime: Date.now() / 1000,
      },
      {
        signature: "0x3b198bdb8b0d149d9e513a2df1ceb0b01f8ff9d7c3a3324a3eb35be4cdd6bb73",
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        status: "success",
        type: "Swap",
        amount: -0.5,
        blockTime: (Date.now() - 86400000) / 1000,
      },
    ]

    return NextResponse.json({ transactions: mockTransactions })
  } catch (error) {
    console.error("Error fetching Ethereum transactions:", error)
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 })
  }
}
