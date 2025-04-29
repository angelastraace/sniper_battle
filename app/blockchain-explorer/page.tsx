import type { Metadata } from "next"
import BlockchainExplorerClient from "./blockchain-explorer-client"

export const metadata: Metadata = {
  title: "Blockchain Explorer | Real-time Ethereum & Solana Data",
  description: "Live blockchain data for Ethereum and Solana networks",
}

export default function BlockchainExplorerPage() {
  return <BlockchainExplorerClient />
}
