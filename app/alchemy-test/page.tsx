import { AlchemyTest } from "@/components/alchemy-test"

export default function AlchemyTestPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6 text-center">Alchemy SDK Proxy Test</h1>
      <div className="max-w-2xl mx-auto">
        <AlchemyTest />
      </div>
    </div>
  )
}
