import type { Metadata } from "next"
import SolanaStablecoinClient from "./solana-stablecoin-client"

export const metadata: Metadata = {
  title: "Solana Stablecoin Network | Blockchain Explorer",
  description: "Explore Solana stablecoin statistics, distribution, and transactions",
}

export default function SolanaStablecoinPage() {
  return <SolanaStablecoinClient />
}
