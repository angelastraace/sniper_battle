import { Connection, type ConnectionConfig } from "@solana/web3.js"

// Track failed RPC endpoints and their last failure time
const failedEndpoints = new Map<string, number>()
const RETRY_TIMEOUT = 60000 // 1 minute timeout before retrying a failed endpoint

// Get a connection with fallback support
export function getConnectionWithFallback(config?: ConnectionConfig): Connection {
  // Use the primary RPC URL from environment variable or our Pages Router API endpoint
  const primaryRpcUrl = process.env.SOLANA_PROXY_URL || "/api/solana"

  // Define reliable mainnet backup endpoints
  const backupRpcUrls = [
    "/api/solana", // Our Pages Router API endpoint
    "/api/rpc/solana", // Our App Router proxy endpoint as fallback
  ]

  // Try each backup endpoint first to avoid the access forbidden error with the primary
  for (const backupUrl of backupRpcUrls) {
    if (!isEndpointFailed(backupUrl)) {
      return new Connection(backupUrl, {
        ...config,
        maxSupportedTransactionVersion: 0,
      })
    }
  }

  // If all backups failed, try the primary if it hasn't failed
  if (!isEndpointFailed(primaryRpcUrl)) {
    return new Connection(primaryRpcUrl, {
      ...config,
      maxSupportedTransactionVersion: 0,
    })
  }

  // If all endpoints have failed, reset the oldest failed endpoint and try again
  const oldestFailedEndpoint = getOldestFailedEndpoint()
  if (oldestFailedEndpoint) {
    failedEndpoints.delete(oldestFailedEndpoint)
    return new Connection(oldestFailedEndpoint, {
      ...config,
      maxSupportedTransactionVersion: 0,
    })
  }

  // If we somehow have no endpoints at all, use the primary as a last resort
  return new Connection(primaryRpcUrl, {
    ...config,
    maxSupportedTransactionVersion: 0,
  })
}

// Check if an endpoint is currently marked as failed
function isEndpointFailed(endpoint: string): boolean {
  const failureTime = failedEndpoints.get(endpoint)
  if (!failureTime) return false

  // If the failure timeout has passed, allow retrying the endpoint
  if (Date.now() - failureTime > RETRY_TIMEOUT) {
    failedEndpoints.delete(endpoint)
    return false
  }

  return true
}

// Get the oldest failed endpoint
function getOldestFailedEndpoint(): string | null {
  if (failedEndpoints.size === 0) return null

  let oldestEndpoint: string | null = null
  let oldestTime = Date.now()

  for (const [endpoint, time] of failedEndpoints.entries()) {
    if (time < oldestTime) {
      oldestTime = time
      oldestEndpoint = endpoint
    }
  }

  return oldestEndpoint
}

// Mark an endpoint as failed
export function markEndpointFailed(endpoint: string): void {
  failedEndpoints.set(endpoint, Date.now())
}

// Execute a Solana RPC call with fallback
export async function executeWithFallback<T>(operation: (connection: Connection) => Promise<T>): Promise<T> {
  // Try with the primary connection first
  let connection = getConnectionWithFallback()
  let lastError: Error | null = null

  // Try each endpoint until one works
  for (let attempts = 0; attempts < 5; attempts++) {
    try {
      return await operation(connection)
    } catch (error) {
      // If the endpoint fails, mark it as failed
      markEndpointFailed(connection.rpcEndpoint)
      lastError = error instanceof Error ? error : new Error(String(error))

      // Try the next endpoint
      connection = getConnectionWithFallback()
    }
  }

  // If all endpoints fail, throw the last error
  throw lastError || new Error("All RPC endpoints failed")
}
