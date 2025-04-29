// Format a Solana public key for display
export function formatPublicKey(publicKey: string): string {
  if (!publicKey) return ""
  if (publicKey.length <= 12) return publicKey
  return `${publicKey.slice(0, 6)}...${publicKey.slice(-4)}`
}

// Format SOL amount with proper decimal places
export function formatSol(lamports: number): string {
  const sol = lamports / 1e9
  if (sol < 0.001) {
    return sol.toFixed(9)
  } else if (sol < 1) {
    return sol.toFixed(6)
  } else {
    return sol.toFixed(4)
  }
}

// Check if a string is a valid Solana public key
export function isValidPublicKey(address: string): boolean {
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)
}
