export function formatNumber(num: number, decimals = 2): string {
  return num.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

export function formatLargeNumber(num: number): string {
  if (num >= 1e12) return `${(num / 1e12).toFixed(2)}T`
  if (num >= 1e9) return `${(num / 1e9).toFixed(2)}B`
  if (num >= 1e6) return `${(num / 1e6).toFixed(2)}M`
  if (num >= 1e3) return `${(num / 1e3).toFixed(2)}K`
  return formatNumber(num)
}

export function formatAddress(address: string): string {
  if (!address) return "Unknown"
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`
}

export function formatPercentage(value: number): string {
  const formatted = formatNumber(value, 2)
  return value >= 0 ? `+${formatted}%` : `${formatted}%`
}
