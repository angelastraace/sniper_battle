// lib/solanaClient.ts

// Default to /api/solana if the environment variable isn't set
const SOLANA_PROXY_URL = process.env.NEXT_PUBLIC_SOLANA_PROXY_URL || "/api/solana"

export async function callSolana(method: string, params: any[] = []) {
  try {
    const response = await fetch(SOLANA_PROXY_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: Date.now(),
        method,
        params,
      }),
    })

    if (!response.ok) {
      const text = await response.text()
      throw new Error(`Proxy Error ${response.status}: ${text}`)
    }

    const json = await response.json()

    if (json.error) {
      throw new Error(`Solana RPC Error: ${json.error.message || JSON.stringify(json.error)}`)
    }

    return json.result
  } catch (error) {
    console.error(`[Solana RPC Error] ${method}:`, error)
    throw error
  }
}

// Helper functions for common operations
export async function getSolanaBalance(address: string): Promise<number> {
  const result = await callSolana("getBalance", [address])
  return result.value / 1e9 // Convert lamports to SOL
}

export async function getSolanaTransactions(address: string, limit = 10): Promise<any[]> {
  const result = await callSolana("getSignaturesForAddress", [address, { limit }])
  return result || []
}

export async function getSolanaTransaction(signature: string): Promise<any> {
  return callSolana("getTransaction", [signature, { encoding: "jsonParsed", maxSupportedTransactionVersion: 0 }])
}

export { SOLANA_PROXY_URL }
