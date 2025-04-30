import { RpcConnectionTester } from "@/components/rpc-connection-tester"

export default function RpcTestPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6 text-center">RPC Proxy Test</h1>
      <RpcConnectionTester />
    </div>
  )
}
