import type { Metadata } from "next"
import RaydiumAmmClient from "./raydium-amm-client"

export const metadata: Metadata = {
  title: "Raydium AMM | Blockchain Explorer",
  description: "Explore Raydium AMM statistics, pools, and transactions on Solana",
}

export default function RaydiumAmmPage() {
  return <RaydiumAmmClient />
}
