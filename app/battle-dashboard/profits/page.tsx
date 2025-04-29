import type { Metadata } from "next"
import ProfitManagementPage from "./profit-management-page"

export const metadata: Metadata = {
  title: "Profit Management | Ace Sniper Battle Station",
  description: "Manage and transfer your trading profits",
}

export default function ProfitsPage() {
  return (
    <div className="p-6 space-y-6 pb-20">
      <h1 className="text-3xl font-bold text-white mb-6">Profit Management</h1>
      <ProfitManagementPage />
    </div>
  )
}
