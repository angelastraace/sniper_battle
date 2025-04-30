"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import WalletController from "@/app/components/wallet-controller"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertTriangle, Shield } from "lucide-react"

export default function WalletManagement() {
  const [activeChain, setActiveChain] = useState<"ethereum" | "bsc" | "solana">("ethereum")

  return (
    <div className="container mx-auto p-4 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Wallet Management</CardTitle>
          <CardDescription>Manage your blockchain wallets and view transaction history</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="warning" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Security Warning</AlertTitle>
            <AlertDescription className="flex items-center">
              <Shield className="mr-2 h-4 w-4" />
              Private keys are stored in your browser&apos;s local storage. Never share your private keys.
            </AlertDescription>
          </Alert>

          <Tabs defaultValue="ethereum" onValueChange={(value) => setActiveChain(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="ethereum">Ethereum</TabsTrigger>
              <TabsTrigger value="solana">Solana</TabsTrigger>
              <TabsTrigger value="bsc">BSC</TabsTrigger>
            </TabsList>
            <TabsContent value="ethereum" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <WalletController chain="ethereum" />
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center h-40 text-muted-foreground">
                      <AlertTriangle className="mr-2 h-4 w-4" />
                      Network disconnected
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="solana" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <WalletController chain="solana" />
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center h-40 text-muted-foreground">
                      <AlertTriangle className="mr-2 h-4 w-4" />
                      Network disconnected
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="bsc" className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <WalletController chain="bsc" />
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Transactions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center h-40 text-muted-foreground">
                      <AlertTriangle className="mr-2 h-4 w-4" />
                      Network disconnected
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
