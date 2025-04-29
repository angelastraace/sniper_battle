import type { Metadata } from "next"
import WalletPage from "./wallet-page"

export const metadata: Metadata = {
  title: "Wallet | Ace Sniper Battle Station",
  description: "Wallet management for blockchain operations",
}

export default function Wallet() {
  return <WalletPage />
}
