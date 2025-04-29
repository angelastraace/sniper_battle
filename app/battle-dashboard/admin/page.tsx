import { Suspense } from "react"
import BackendStatus from "@/app/components/backend-status"
import GasEstimator from "@/app/components/gas-estimator"
import TokenScanner from "@/app/components/token-scanner"
import WalletController from "@/app/components/wallet-controller"
import { Loader2 } from "lucide-react"

export default function AdminDashboard() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-white mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Suspense fallback={<LoadingCard />}>
          <BackendStatus />
        </Suspense>

        <Suspense fallback={<LoadingCard />}>
          <GasEstimator />
        </Suspense>

        <Suspense fallback={<LoadingCard />}>
          <WalletController chain="ethereum" />
        </Suspense>

        <div className="md:col-span-2 lg:col-span-3">
          <Suspense fallback={<LoadingCard />}>
            <TokenScanner />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

function LoadingCard() {
  return (
    <div className="border rounded-lg border-gray-800 bg-gray-900 p-6 flex justify-center items-center min-h-[300px]">
      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
    </div>
  )
}
