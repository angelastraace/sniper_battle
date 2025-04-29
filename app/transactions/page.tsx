"use client"
import TransactionViewer from "@/app/components/transaction-viewer"
import LatestTransactions from "@/app/components/latest-transactions"
import LatestBlocks from "@/app/components/latest-blocks"
import NavBar from "@/components/NavBar"

export default function TransactionsPage() {
  return (
    <div className="container mx-auto p-4">
      <NavBar activePage="tx" />
      <h1 className="text-3xl font-bold mb-6">Transaction Explorer</h1>

      <div className="grid grid-cols-1 gap-6 mb-6">
        <TransactionViewer />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LatestTransactions />
        <LatestBlocks />
      </div>
    </div>
  )
}
