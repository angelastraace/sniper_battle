"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { FileText, AlertCircle, Check, X, Loader2, Download, Upload, Search, Filter, Zap } from "lucide-react"
import { analyzeWordlist, extractPotentialSeedPhrases } from "../utils/wordlist-analyzer"
import { addSystemLog } from "../services/blockchain-monitor"
import * as bip39 from "bip39"

interface WordlistAnalyzerProps {
  onAddPhrases?: (phrases: string[]) => void
}

export default function WordlistAnalyzer({ onAddPhrases }: WordlistAnalyzerProps) {
  const [activeTab, setActiveTab] = useState("analyze")
  const [fileContent, setFileContent] = useState("")
  const [fileName, setFileName] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const [extractedPhrases, setExtractedPhrases] = useState<string[]>([])
  const [progress, setProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)

    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      setFileContent(content)
    }

    reader.readAsText(file)
  }

  // Trigger file input click
  const triggerFileUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  // Analyze wordlist
  const analyzeCurrentWordlist = () => {
    if (!fileContent) return

    setIsAnalyzing(true)
    setProgress(0)

    // Use setTimeout to avoid blocking the UI
    setTimeout(() => {
      try {
        // Split content into words
        const words = fileContent
          .split(/[\s\n,;]+/)
          .map((w) => w.toLowerCase().trim())
          .filter((w) => w)

        setProgress(30)

        // Analyze if it's a BIP39 wordlist
        const bip39Analysis = analyzeWordlist(words)

        setProgress(60)

        // Extract potential seed phrases
        const potentialPhrases = extractPotentialSeedPhrases(words)

        setProgress(90)

        // Create analysis result
        const result = {
          fileName,
          totalWords: words.length,
          uniqueWords: new Set(words).size,
          bip39Analysis,
          potentialPhrases,
          bip39WordCount: words.filter((word) => bip39.wordlists.english.includes(word)).length,
        }

        setAnalysisResult(result)
        setExtractedPhrases(potentialPhrases)

        addSystemLog(
          "INFO",
          `Analyzed wordlist "${fileName}": ${result.totalWords} words, ${potentialPhrases.length} potential seed phrases`,
        )

        setProgress(100)
      } catch (error) {
        console.error("Error analyzing wordlist:", error)
        addSystemLog("ERROR", `Error analyzing wordlist: ${error instanceof Error ? error.message : String(error)}`)
      } finally {
        setIsAnalyzing(false)
      }
    }, 10)
  }

  // Add extracted phrases to scanner
  const addToScanner = () => {
    if (onAddPhrases && extractedPhrases.length > 0) {
      onAddPhrases(extractedPhrases)
      addSystemLog("INFO", `Added ${extractedPhrases.length} extracted seed phrases to scanner`)
    }
  }

  // Download extracted phrases
  const downloadPhrases = () => {
    if (extractedPhrases.length === 0) return

    const content = extractedPhrases.join("\n")
    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `extracted-seed-phrases-${new Date().toISOString().slice(0, 10)}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    addSystemLog("INFO", `Downloaded ${extractedPhrases.length} extracted seed phrases`)
  }

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-white flex items-center">
          <Search className="mr-2 h-5 w-5" />
          Wordlist Analyzer
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-800">
            <TabsTrigger value="analyze" className="text-white data-[state=active]:bg-gray-700">
              Analyze
            </TabsTrigger>
            <TabsTrigger value="extract" className="text-white data-[state=active]:bg-gray-700">
              Extract Phrases
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analyze" className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label className="text-white">Upload Wordlist File</Label>
              <div className="flex gap-2">
                <Button onClick={triggerFileUpload} variant="outline" className="flex-1">
                  <FileText className="mr-2 h-4 w-4" />
                  Select File
                </Button>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.csv,.json,.list"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
              {fileName && <div className="text-sm text-gray-400">Selected file: {fileName}</div>}
            </div>

            {fileContent && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-white">File Preview</Label>
                  <Badge variant="outline" className="bg-blue-900/20 text-blue-400">
                    {fileContent.length.toLocaleString()} characters
                  </Badge>
                </div>
                <div className="bg-gray-800 p-3 rounded-md border border-gray-700 h-20 overflow-y-auto">
                  <pre className="text-xs font-mono">{fileContent.slice(0, 500)}...</pre>
                </div>
                <Button onClick={analyzeCurrentWordlist} disabled={isAnalyzing} className="w-full">
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Analyze Wordlist
                    </>
                  )}
                </Button>
              </div>
            )}

            {isAnalyzing && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Analyzing wordlist...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            {analysisResult && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-gray-800 p-3 rounded-md border border-gray-700">
                    <div className="text-sm font-medium mb-1">Total Words</div>
                    <div className="text-xl font-bold">{analysisResult.totalWords.toLocaleString()}</div>
                  </div>
                  <div className="bg-gray-800 p-3 rounded-md border border-gray-700">
                    <div className="text-sm font-medium mb-1">Unique Words</div>
                    <div className="text-xl font-bold">{analysisResult.uniqueWords.toLocaleString()}</div>
                  </div>
                  <div className="bg-gray-800 p-3 rounded-md border border-gray-700">
                    <div className="text-sm font-medium mb-1">BIP39 Words</div>
                    <div className="text-xl font-bold">{analysisResult.bip39WordCount.toLocaleString()}</div>
                  </div>
                  <div className="bg-gray-800 p-3 rounded-md border border-gray-700">
                    <div className="text-sm font-medium mb-1">Potential Phrases</div>
                    <div className="text-xl font-bold">{analysisResult.potentialPhrases.length.toLocaleString()}</div>
                  </div>
                </div>

                <div className="bg-gray-800 p-3 rounded-md border border-gray-700">
                  <div className="text-sm font-medium mb-2">BIP39 Wordlist Analysis</div>
                  <div className="flex items-center mb-2">
                    <div className="mr-2">
                      {analysisResult.bip39Analysis.isBIP39Wordlist ? (
                        <Badge className="bg-green-900/20 text-green-400 border-green-800">
                          <Check className="h-3 w-3 mr-1" /> BIP39 Wordlist
                        </Badge>
                      ) : (
                        <Badge className="bg-yellow-900/20 text-yellow-400 border-yellow-800">
                          <X className="h-3 w-3 mr-1" /> Not a BIP39 Wordlist
                        </Badge>
                      )}
                    </div>
                    {analysisResult.bip39Analysis.language && (
                      <Badge variant="outline" className="ml-2">
                        {analysisResult.bip39Analysis.language}
                      </Badge>
                    )}
                  </div>
                  <div className="text-sm">
                    <div className="flex justify-between mb-1">
                      <span>BIP39 Coverage:</span>
                      <span>{(analysisResult.bip39Analysis.coverage * 100).toFixed(2)}%</span>
                    </div>
                    <Progress value={analysisResult.bip39Analysis.coverage * 100} className="h-2 mb-2" />
                    <div>{analysisResult.bip39Analysis.matchCount} of 2048 BIP39 words found</div>
                  </div>
                </div>

                {analysisResult.potentialPhrases.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <Label className="text-white">Potential Seed Phrases</Label>
                      <Badge variant="outline" className="bg-green-900/20 text-green-400">
                        {analysisResult.potentialPhrases.length} phrases
                      </Badge>
                    </div>
                    <div className="bg-gray-800 p-3 rounded-md border border-gray-700 h-40 overflow-y-auto">
                      {analysisResult.potentialPhrases.slice(0, 20).map((phrase: string, index: number) => (
                        <div key={index} className="text-xs font-mono mb-1 break-all">
                          {phrase}
                        </div>
                      ))}
                      {analysisResult.potentialPhrases.length > 20 && (
                        <div className="text-xs text-gray-400 mt-2">
                          ...and {analysisResult.potentialPhrases.length - 20} more
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={downloadPhrases} variant="outline" className="flex-1">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                      <Button onClick={addToScanner} className="flex-1">
                        <Upload className="mr-2 h-4 w-4" />
                        Add to Scanner
                      </Button>
                    </div>
                  </div>
                )}

                <Alert variant="default" className="bg-gray-800 border-gray-700">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  <AlertDescription className="text-xs">
                    <p className="font-medium mb-1">Analysis Results</p>
                    {analysisResult.bip39Analysis.isBIP39Wordlist ? (
                      <p>
                        This appears to be a BIP39 wordlist for the {analysisResult.bip39Analysis.language} language. It
                        contains {analysisResult.bip39Analysis.matchCount} of the 2048 official BIP39 words.
                      </p>
                    ) : analysisResult.bip39WordCount > 100 ? (
                      <p>
                        This wordlist contains {analysisResult.bip39WordCount} BIP39 words, which is enough to generate
                        valid seed phrases. {analysisResult.potentialPhrases.length} potential seed phrases were
                        extracted.
                      </p>
                    ) : (
                      <p>
                        This wordlist doesn't contain many BIP39 words. It's unlikely to be useful for finding
                        cryptocurrency wallets without conversion.
                      </p>
                    )}
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </TabsContent>

          <TabsContent value="extract" className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="wordlist-text" className="text-white">
                Enter Text to Extract Seed Phrases
              </Label>
              <Textarea
                id="wordlist-text"
                placeholder="Paste text containing potential seed phrases..."
                value={fileContent}
                onChange={(e) => setFileContent(e.target.value)}
                className="font-mono"
                rows={8}
              />
            </div>

            <Button onClick={analyzeCurrentWordlist} disabled={isAnalyzing || !fileContent} className="w-full">
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Extracting...
                </>
              ) : (
                <>
                  <Filter className="mr-2 h-4 w-4" />
                  Extract Seed Phrases
                </>
              )}
            </Button>

            {isAnalyzing && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Analyzing text...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            {extractedPhrases.length > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-white">Extracted Seed Phrases</Label>
                  <Badge variant="outline" className="bg-green-900/20 text-green-400">
                    {extractedPhrases.length} phrases
                  </Badge>
                </div>
                <div className="bg-gray-800 p-3 rounded-md border border-gray-700 h-40 overflow-y-auto">
                  {extractedPhrases.map((phrase, index) => (
                    <div key={index} className="text-xs font-mono mb-1 break-all">
                      {phrase}
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button onClick={downloadPhrases} variant="outline" className="flex-1">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                  <Button onClick={addToScanner} className="flex-1">
                    <Upload className="mr-2 h-4 w-4" />
                    Add to Scanner
                  </Button>
                </div>
              </div>
            )}

            <Alert variant="default" className="bg-gray-800 border-gray-700">
              <Zap className="h-4 w-4 text-yellow-500" />
              <AlertDescription className="text-xs">
                <p className="font-medium mb-1">Extraction Tips</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Paste any text that might contain seed phrases</li>
                  <li>The tool will extract valid BIP39 seed phrases (12, 15, 18, 21, or 24 words)</li>
                  <li>Works with text dumps, logs, or any content with potential phrases</li>
                  <li>For best results, include text with many BIP39 words</li>
                </ul>
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="bg-blue-900/20 border-t border-blue-800 py-2 px-6">
        <div className="w-full flex justify-between items-center">
          <span className="text-sm text-blue-400">BIP39 Wordlist Analyzer</span>
          <span className="text-xs text-blue-400">2048 official BIP39 words</span>
        </div>
      </CardFooter>
    </Card>
  )
}
