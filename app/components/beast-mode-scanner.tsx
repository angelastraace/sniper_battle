"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle, Upload, Cpu, Zap, Clock, Database } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"

export default function BeastModeScanner() {
  const [activeTab, setActiveTab] = useState("single")
  const [phrase, setPhrase] = useState("")
  const [batchPhrases, setBatchPhrases] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [scanResults, setScanResults] = useState<any>(null)
  const [progress, setProgress] = useState(0)
  const [numWorkers, setNumWorkers] = useState(4)
  const [batchSize, setBatchSize] = useState(500)
  const [scanId, setScanId] = useState<string | null>(null)
  const [statusCheckInterval, setStatusCheckInterval] = useState<NodeJS.Timeout | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // Handle single phrase scan
  const handleSingleScan = async () => {
    if (!phrase.trim()) {
      toast({
        title: "Error",
        description: "Please enter a phrase to scan",
        variant: "destructive",
      })
      return
    }

    setIsScanning(true)
    setScanResults(null)
    setProgress(10)

    try {
      const response = await fetch("/api/scanner/scan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ phrase: phrase.trim() }),
      })

      setProgress(100)
      const data = await response.json()

      if (data.success) {
        setScanResults(data)
        toast({
          title: "Scan Complete",
          description: `Processed ${data.totalProcessed} phrases`,
        })
      } else {
        toast({
          title: "Scan Failed",
          description: data.error || "Unknown error",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error scanning phrase:", error)
      toast({
        title: "Error",
        description: "Failed to scan phrase. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsScanning(false)
    }
  }

  // Handle batch scan
  const handleBatchScan = async () => {
    if (!batchPhrases.trim()) {
      toast({
        title: "Error",
        description: "Please enter phrases to scan",
        variant: "destructive",
      })
      return
    }

    const phrases = batchPhrases
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)

    if (phrases.length === 0) {
      toast({
        title: "Error",
        description: "No valid phrases found",
        variant: "destructive",
      })
      return
    }

    setIsScanning(true)
    setScanResults(null)
    setProgress(10)

    try {
      const response = await fetch("/api/scanner/batch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phrases,
          numWorkers,
          batchSize,
        }),
      })

      setProgress(100)
      const data = await response.json()

      if (data.success) {
        setScanResults(data)
        toast({
          title: "Scan Complete",
          description: `Processed ${data.totalProcessed} phrases`,
        })
      } else {
        toast({
          title: "Scan Failed",
          description: data.error || "Unknown error",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error scanning batch:", error)
      toast({
        title: "Error",
        description: "Failed to scan phrases. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsScanning(false)
    }
  }

  // Handle file upload
  const handleFileUpload = async () => {
    if (!file) {
      toast({
        title: "Error",
        description: "Please select a file to upload",
        variant: "destructive",
      })
      return
    }

    setIsScanning(true)
    setScanResults(null)
    setProgress(10)

    const formData = new FormData()
    formData.append("file", file)
    formData.append("numWorkers", numWorkers.toString())
    formData.append("batchSize", batchSize.toString())

    try {
      const response = await fetch("/api/scanner/upload", {
        method: "POST",
        body: formData,
      })

      setProgress(30)
      const data = await response.json()

      if (data.success) {
        setScanId(data.scanId)
        toast({
          title: "Upload Complete",
          description: `Scanning ${data.phraseCount} phrases in the background`,
        })

        // Start polling for status
        const interval = setInterval(checkScanStatus, 5000, data.scanId)
        setStatusCheckInterval(interval)
      } else {
        toast({
          title: "Upload Failed",
          description: data.error || "Unknown error",
          variant: "destructive",
        })
        setIsScanning(false)
      }
    } catch (error) {
      console.error("Error uploading file:", error)
      toast({
        title: "Error",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      })
      setIsScanning(false)
    }
  }

  // Check scan status
  const checkScanStatus = async (id: string) => {
    try {
      const response = await fetch(`/api/scanner/status/${id}`)
      const data = await response.json()

      if (data.success) {
        if (data.status === "completed") {
          // Scan completed
          clearInterval(statusCheckInterval!)
          setStatusCheckInterval(null)
          setScanResults(data.data)
          setProgress(100)
          setIsScanning(false)
          toast({
            title: "Scan Complete",
            description: `Processed ${data.data.total_processed} phrases`,
          })
        } else if (data.status === "failed") {
          // Scan failed
          clearInterval(statusCheckInterval!)
          setStatusCheckInterval(null)
          setIsScanning(false)
          setProgress(100)
          toast({
            title: "Scan Failed",
            description: data.data.error || "Unknown error",
            variant: "destructive",
          })
        } else {
          // Still in progress
          setProgress(50) // We don't know exact progress, so show indeterminate
        }
      }
    } catch (error) {
      console.error("Error checking scan status:", error)
    }
  }

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
    }
  }

  // View wallet hits
  const viewWalletHits = () => {
    router.push("/wallet-hits")
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-6 w-6 text-yellow-500" />
          ACE SNIPER: BEAST MODE
        </CardTitle>
        <CardDescription>Multithreaded high-performance phrase scanner for Solana and Ethereum</CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="single">Single Phrase</TabsTrigger>
            <TabsTrigger value="batch">Batch Scan</TabsTrigger>
            <TabsTrigger value="file">File Upload</TabsTrigger>
          </TabsList>

          <TabsContent value="single">
            <div className="space-y-4">
              <div>
                <Label htmlFor="phrase">Enter Seed Phrase</Label>
                <Textarea
                  id="phrase"
                  placeholder="Enter a seed phrase or partial phrase to scan"
                  value={phrase}
                  onChange={(e) => setPhrase(e.target.value)}
                  rows={3}
                  className="mt-1"
                  disabled={isScanning}
                />
              </div>

              <Button onClick={handleSingleScan} disabled={isScanning || !phrase.trim()} className="w-full">
                {isScanning ? "Scanning..." : "Scan Phrase"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="batch">
            <div className="space-y-4">
              <div>
                <Label htmlFor="batchPhrases">Enter Multiple Phrases (one per line)</Label>
                <Textarea
                  id="batchPhrases"
                  placeholder="Enter phrases to scan (one per line)"
                  value={batchPhrases}
                  onChange={(e) => setBatchPhrases(e.target.value)}
                  rows={6}
                  className="mt-1"
                  disabled={isScanning}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="numWorkers">Worker Threads: {numWorkers}</Label>
                  <Slider
                    id="numWorkers"
                    min={1}
                    max={16}
                    step={1}
                    value={[numWorkers]}
                    onValueChange={(value) => setNumWorkers(value[0])}
                    disabled={isScanning}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="batchSize">Batch Size: {batchSize}</Label>
                  <Slider
                    id="batchSize"
                    min={100}
                    max={1000}
                    step={100}
                    value={[batchSize]}
                    onValueChange={(value) => setBatchSize(value[0])}
                    disabled={isScanning}
                    className="mt-2"
                  />
                </div>
              </div>

              <Button onClick={handleBatchScan} disabled={isScanning || !batchPhrases.trim()} className="w-full">
                {isScanning ? "Scanning..." : "Scan Batch"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="file">
            <div className="space-y-4">
              <div className="border-2 border-dashed rounded-md p-6 text-center">
                <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-500 mb-2">Upload a text file with phrases (one per line)</p>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt"
                  onChange={handleFileChange}
                  className="hidden"
                  disabled={isScanning}
                />
                <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isScanning}>
                  Select File
                </Button>
                {file && (
                  <p className="mt-2 text-sm">
                    Selected: <span className="font-medium">{file.name}</span> ({(file.size / 1024).toFixed(2)} KB)
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fileNumWorkers">Worker Threads: {numWorkers}</Label>
                  <Slider
                    id="fileNumWorkers"
                    min={1}
                    max={16}
                    step={1}
                    value={[numWorkers]}
                    onValueChange={(value) => setNumWorkers(value[0])}
                    disabled={isScanning}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="fileBatchSize">Batch Size: {batchSize}</Label>
                  <Slider
                    id="fileBatchSize"
                    min={100}
                    max={1000}
                    step={100}
                    value={[batchSize]}
                    onValueChange={(value) => setBatchSize(value[0])}
                    disabled={isScanning}
                    className="mt-2"
                  />
                </div>
              </div>

              <Button onClick={handleFileUpload} disabled={isScanning || !file} className="w-full">
                {isScanning ? "Uploading & Scanning..." : "Upload & Scan"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {isScanning && (
          <div className="mt-4">
            <Label>Scanning Progress</Label>
            <Progress value={progress} className="mt-2" />
            <p className="text-sm text-gray-500 mt-1">
              {scanId ? "Background scan in progress..." : "Processing phrases..."}
            </p>
          </div>
        )}

        {scanResults && (
          <div className="mt-6 space-y-4">
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-lg font-medium mb-2">Scan Results</h3>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <Cpu className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm text-gray-500">Processed</p>
                    <p className="font-medium">{scanResults.totalProcessed || scanResults.total_processed || 0}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm text-gray-500">Valid Phrases</p>
                    <p className="font-medium">{scanResults.totalValid || scanResults.total_valid || 0}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-sm text-gray-500">Time (seconds)</p>
                    <p className="font-medium">{scanResults.timeSeconds || scanResults.time_seconds || 0}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  <div>
                    <p className="text-sm text-gray-500">Rate (phrases/sec)</p>
                    <p className="font-medium">{scanResults.rate || 0}</p>
                  </div>
                </div>
              </div>

              {/* Funded wallets section */}
              {((scanResults.results && scanResults.results.length > 0) ||
                (scanResults.funded_wallets && scanResults.funded_wallets.length > 0)) && (
                <div className="mt-4">
                  <h4 className="font-medium mb-2 flex items-center gap-1">
                    <Database className="h-4 w-4 text-green-500" />
                    Funded Wallets Found
                  </h4>

                  <div className="space-y-3 max-h-60 overflow-y-auto p-2">
                    {(scanResults.results || scanResults.funded_wallets || []).map((result: any, index: number) => (
                      <div key={index} className="bg-white p-3 rounded border">
                        <p className="text-sm font-medium mb-1">Phrase: {result.processedPhrase || result.phrase}</p>

                        {result.solanaWallet && (
                          <div className="flex items-center gap-1 text-sm">
                            <Badge variant="outline" className="bg-purple-50">
                              Solana
                            </Badge>
                            <span className="font-mono">{result.solanaWallet}</span>
                            <span className="text-green-600 ml-auto">{result.solanaBalance} SOL</span>
                          </div>
                        )}

                        {result.ethereumWallet && (
                          <div className="flex items-center gap-1 text-sm mt-1">
                            <Badge variant="outline" className="bg-blue-50">
                              Ethereum
                            </Badge>
                            <span className="font-mono">{result.ethereumWallet}</span>
                            <span className="text-green-600 ml-auto">{result.ethereumBalance} ETH</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No funded wallets message */}
              {(!scanResults.results || scanResults.results.length === 0) &&
                (!scanResults.funded_wallets || scanResults.funded_wallets.length === 0) && (
                  <Alert className="mt-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>No funded wallets found</AlertTitle>
                    <AlertDescription>All scanned wallets had zero balance.</AlertDescription>
                  </Alert>
                )}
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => router.push("/dashboard")}>
          Back to Dashboard
        </Button>
        <Button onClick={viewWalletHits} variant="secondary">
          View All Wallet Hits
        </Button>
      </CardFooter>
    </Card>
  )
}
