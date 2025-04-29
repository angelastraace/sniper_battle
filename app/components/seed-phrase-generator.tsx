"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { RefreshCw, Copy, Check, Download, Upload, AlertCircle, Key, Shuffle, FileText } from "lucide-react"
import {
  generateMnemonic,
  isValidMnemonic,
  createWordCombinations,
  extractPotentialSeedPhrases,
  BIP39_WORDLIST,
} from "../utils/bip39-utils"
import { addSystemLog } from "../services/blockchain-monitor"

interface SeedPhraseGeneratorProps {
  onAddPhrases?: (phrases: string[]) => void
}

export default function SeedPhraseGenerator({ onAddPhrases }: SeedPhraseGeneratorProps) {
  const [activeTab, setActiveTab] = useState("generate")
  const [wordCount, setWordCount] = useState<12 | 15 | 18 | 21 | 24>(12)
  const [seedPhrase, setSeedPhrase] = useState("")
  const [generatedPhrases, setGeneratedPhrases] = useState<string[]>([])
  const [copied, setCopied] = useState(false)
  const [wordlist, setWordlist] = useState<string[]>([])
  const [combinationCount, setCombinationCount] = useState(10)
  const [isGenerating, setIsGenerating] = useState(false)
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean
    message: string
  } | null>(null)
  const [customPhrase, setCustomPhrase] = useState("")
  const [extractedPhrases, setExtractedPhrases] = useState<string[]>([])

  // Generate a new seed phrase
  const generateNewSeedPhrase = () => {
    const phrase = generateMnemonic(wordCount)
    setSeedPhrase(phrase)
    setCopied(false)

    // Validate just to be sure
    setValidationResult({
      isValid: true,
      message: `Valid ${wordCount}-word BIP39 seed phrase`,
    })
  }

  // Generate multiple seed phrases
  const generateMultiplePhrases = (count: number) => {
    setIsGenerating(true)

    // Use setTimeout to avoid blocking the UI
    setTimeout(() => {
      const phrases: string[] = []
      for (let i = 0; i < count; i++) {
        phrases.push(generateMnemonic(wordCount))
      }
      setGeneratedPhrases(phrases)
      setIsGenerating(false)

      addSystemLog("INFO", `Generated ${count} BIP39 seed phrases (${wordCount} words each)`)
    }, 10)
  }

  // Copy seed phrase to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Download generated phrases
  const downloadPhrases = () => {
    const content = generatedPhrases.join("\n")
    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `seed-phrases-${wordCount}-words-${new Date().toISOString().slice(0, 10)}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    addSystemLog("INFO", `Downloaded ${generatedPhrases.length} seed phrases`)
  }

  // Add generated phrases to scanner
  const addToScanner = () => {
    if (onAddPhrases && generatedPhrases.length > 0) {
      onAddPhrases(generatedPhrases)
      addSystemLog("INFO", `Added ${generatedPhrases.length} seed phrases to scanner`)
    }
  }

  // Validate a seed phrase
  const validateSeedPhrase = (phrase: string) => {
    if (!phrase.trim()) {
      setValidationResult(null)
      return
    }

    const isValid = isValidMnemonic(phrase.trim())
    const wordCount = phrase.trim().split(/\s+/).length

    setValidationResult({
      isValid,
      message: isValid ? `Valid ${wordCount}-word BIP39 seed phrase` : `Invalid BIP39 seed phrase (${wordCount} words)`,
    })
  }

  // Generate combinations from wordlist
  const generateCombinations = () => {
    if (wordlist.length < wordCount) {
      addSystemLog("WARNING", `Not enough words to generate ${wordCount}-word combinations`)
      return
    }

    setIsGenerating(true)

    // Use setTimeout to avoid blocking the UI
    setTimeout(() => {
      const combinations = createWordCombinations(wordlist, wordCount, combinationCount)
      setGeneratedPhrases(combinations)
      setIsGenerating(false)

      addSystemLog("INFO", `Generated ${combinations.length} valid BIP39 seed phrase combinations`)
    }, 10)
  }

  // Extract potential seed phrases from text
  const extractSeedPhrases = () => {
    if (!customPhrase.trim()) return

    const words = customPhrase
      .trim()
      .toLowerCase()
      .split(/[\s\n,;]+/)
      .filter((w) => w)

    // Check for valid seed phrases in the text
    const extracted = extractPotentialSeedPhrases(words, wordCount)
    setExtractedPhrases(extracted)

    if (extracted.length > 0) {
      addSystemLog("INFO", `Extracted ${extracted.length} potential seed phrases`)
    } else {
      addSystemLog("INFO", "No valid seed phrases found in the text")
    }
  }

  // Add extracted phrases to scanner
  const addExtractedToScanner = () => {
    if (onAddPhrases && extractedPhrases.length > 0) {
      onAddPhrases(extractedPhrases)
      addSystemLog("INFO", `Added ${extractedPhrases.length} extracted seed phrases to scanner`)
    }
  }

  // Generate initial seed phrase on mount
  useEffect(() => {
    generateNewSeedPhrase()
  }, [wordCount])

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-white flex items-center">
          <Key className="mr-2 h-5 w-5" />
          BIP39 Seed Phrase Generator
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800">
            <TabsTrigger value="generate" className="text-white data-[state=active]:bg-gray-700">
              Generate
            </TabsTrigger>
            <TabsTrigger value="validate" className="text-white data-[state=active]:bg-gray-700">
              Validate
            </TabsTrigger>
            <TabsTrigger value="combine" className="text-white data-[state=active]:bg-gray-700">
              Combine
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generate" className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="word-count" className="text-white">
                Word Count
              </Label>
              <Select
                value={wordCount.toString()}
                onValueChange={(value) => setWordCount(Number(value) as 12 | 15 | 18 | 21 | 24)}
              >
                <SelectTrigger id="word-count">
                  <SelectValue placeholder="Select word count" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12">12 words</SelectItem>
                  <SelectItem value="15">15 words</SelectItem>
                  <SelectItem value="18">18 words</SelectItem>
                  <SelectItem value="21">21 words</SelectItem>
                  <SelectItem value="24">24 words</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <Label htmlFor="seed-phrase" className="text-white">
                  Seed Phrase
                </Label>
                <Button variant="ghost" size="sm" onClick={() => copyToClipboard(seedPhrase)} className="h-6 px-2">
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <div className="bg-gray-800 p-3 rounded-md border border-gray-700 font-mono text-sm break-all">
                {seedPhrase}
              </div>
              <Button onClick={generateNewSeedPhrase} className="w-full">
                <RefreshCw className="mr-2 h-4 w-4" />
                Generate New Phrase
              </Button>
            </div>

            <div className="space-y-2">
              <Label className="text-white">Generate Multiple Phrases</Label>
              <div className="flex gap-2">
                <Button
                  onClick={() => generateMultiplePhrases(5)}
                  variant="outline"
                  className="flex-1"
                  disabled={isGenerating}
                >
                  5 Phrases
                </Button>
                <Button
                  onClick={() => generateMultiplePhrases(10)}
                  variant="outline"
                  className="flex-1"
                  disabled={isGenerating}
                >
                  10 Phrases
                </Button>
                <Button
                  onClick={() => generateMultiplePhrases(25)}
                  variant="outline"
                  className="flex-1"
                  disabled={isGenerating}
                >
                  25 Phrases
                </Button>
              </div>
            </div>

            {isGenerating && (
              <div className="flex items-center justify-center py-4">
                <RefreshCw className="h-6 w-6 animate-spin text-blue-500 mr-2" />
                <span>Generating phrases...</span>
              </div>
            )}

            {!isGenerating && generatedPhrases.length > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-white">Generated Phrases</Label>
                  <Badge variant="outline" className="bg-blue-900/20 text-blue-400">
                    {generatedPhrases.length} phrases
                  </Badge>
                </div>
                <div className="bg-gray-800 p-3 rounded-md border border-gray-700 h-40 overflow-y-auto">
                  {generatedPhrases.map((phrase, index) => (
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
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              <AlertDescription className="text-xs">
                <p className="font-medium mb-1">BIP39 Seed Phrases</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>These are valid BIP39 seed phrases used by cryptocurrency wallets</li>
                  <li>Each phrase can generate a unique wallet address</li>
                  <li>The scanner will check if these wallets contain funds</li>
                  <li>12-word phrases are most common, but 24-word phrases are more secure</li>
                </ul>
              </AlertDescription>
            </Alert>
          </TabsContent>

          <TabsContent value="validate" className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="validate-phrase" className="text-white">
                Enter Seed Phrase to Validate
              </Label>
              <Textarea
                id="validate-phrase"
                placeholder="Enter seed phrase (12, 15, 18, 21, or 24 words)"
                value={customPhrase}
                onChange={(e) => {
                  setCustomPhrase(e.target.value)
                  validateSeedPhrase(e.target.value)
                }}
                className="font-mono"
                rows={4}
              />
            </div>

            {validationResult && (
              <div
                className={`p-3 rounded-md border ${validationResult.isValid ? "bg-green-900/20 border-green-800 text-green-400" : "bg-red-900/20 border-red-800 text-red-400"}`}
              >
                {validationResult.message}
              </div>
            )}

            <div className="space-y-2">
              <Label className="text-white">Extract Potential Seed Phrases</Label>
              <p className="text-xs text-gray-400">
                Paste text containing potential seed phrases, and we'll extract valid BIP39 phrases
              </p>
              <Button onClick={extractSeedPhrases} className="w-full">
                <FileText className="mr-2 h-4 w-4" />
                Extract Seed Phrases
              </Button>
            </div>

            {extractedPhrases.length > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-white">Extracted Phrases</Label>
                  <Badge variant="outline" className="bg-green-900/20 text-green-400">
                    {extractedPhrases.length} valid phrases
                  </Badge>
                </div>
                <div className="bg-gray-800 p-3 rounded-md border border-gray-700 h-40 overflow-y-auto">
                  {extractedPhrases.map((phrase, index) => (
                    <div key={index} className="text-xs font-mono mb-1 break-all">
                      {phrase}
                    </div>
                  ))}
                </div>
                <Button onClick={addExtractedToScanner} className="w-full">
                  <Upload className="mr-2 h-4 w-4" />
                  Add to Scanner
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="combine" className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="wordlist" className="text-white">
                Enter Words (one per line)
              </Label>
              <Textarea
                id="wordlist"
                placeholder="Enter words to combine (one per line)"
                value={wordlist.join("\n")}
                onChange={(e) => setWordlist(e.target.value.split("\n").filter((w) => w.trim()))}
                className="font-mono"
                rows={6}
              />
              <p className="text-xs text-gray-400">
                {wordlist.length} words entered. Need at least {wordCount} words from the BIP39 wordlist.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="combination-count" className="text-white">
                Number of Combinations: {combinationCount}
              </Label>
              <Input
                id="combination-count"
                type="range"
                min="1"
                max="100"
                value={combinationCount}
                onChange={(e) => setCombinationCount(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <Button
              onClick={generateCombinations}
              className="w-full"
              disabled={isGenerating || wordlist.length < wordCount}
            >
              <Shuffle className="mr-2 h-4 w-4" />
              Generate Combinations
            </Button>

            {isGenerating && (
              <div className="flex items-center justify-center py-4">
                <RefreshCw className="h-6 w-6 animate-spin text-blue-500 mr-2" />
                <span>Generating combinations...</span>
              </div>
            )}

            {!isGenerating && generatedPhrases.length > 0 && (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label className="text-white">Generated Combinations</Label>
                  <Badge variant="outline" className="bg-blue-900/20 text-blue-400">
                    {generatedPhrases.length} phrases
                  </Badge>
                </div>
                <div className="bg-gray-800 p-3 rounded-md border border-gray-700 h-40 overflow-y-auto">
                  {generatedPhrases.map((phrase, index) => (
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
              <AlertCircle className="h-4 w-4 text-yellow-500" />
              <AlertDescription className="text-xs">
                <p className="font-medium mb-1">Word Combination Tips</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Only words from the official BIP39 wordlist will be used</li>
                  <li>The last word must satisfy the BIP39 checksum</li>
                  <li>Try using words from leaked passwords or common phrases</li>
                  <li>For best results, use words that might be used in a seed phrase</li>
                </ul>
              </AlertDescription>
            </Alert>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="bg-blue-900/20 border-t border-blue-800 py-2 px-6">
        <div className="w-full flex justify-between items-center">
          <span className="text-sm text-blue-400">BIP39 Seed Phrase Generator</span>
          <span className="text-xs text-blue-400">{BIP39_WORDLIST.length} possible words</span>
        </div>
      </CardFooter>
    </Card>
  )
}
