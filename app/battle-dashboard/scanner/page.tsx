import { BattleScannerFeed } from "@/components/battle-scanner-feed"

export default function BattleScannerPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Battle Scanner</h1>
      <p className="text-muted-foreground mb-8">
        Real-time detection of blockchain battles: token mints, liquidity events, and more.
      </p>

      <BattleScannerFeed />
    </div>
  )
}
