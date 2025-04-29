"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

interface TerminalLine {
  text: string
  type: "input" | "output" | "error" | "success"
}

export default function BattleCommandTerminal() {
  const [lines, setLines] = useState<TerminalLine[]>([
    { text: "Battle Command Terminal v1.0.0", type: "output" },
    { text: "Initializing system...", type: "output" },
    { text: "System ready. Type 'help' for available commands.", type: "success" },
  ])
  const [input, setInput] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const terminalRef = useRef<HTMLDivElement>(null)

  const handleCommand = async (cmd: string) => {
    // Add the command to the terminal
    setLines((prev) => [...prev, { text: `> ${cmd}`, type: "input" }])
    setIsProcessing(true)

    // Process the command
    const lowerCmd = cmd.toLowerCase().trim()

    if (lowerCmd === "help") {
      setLines((prev) => [
        ...prev,
        { text: "Available commands:", type: "output" },
        { text: "  help - Show this help message", type: "output" },
        { text: "  status - Show blockchain connection status", type: "output" },
        { text: "  clear - Clear the terminal", type: "output" },
      ])
      setIsProcessing(false)
    } else if (lowerCmd === "status") {
      setLines((prev) => [
        ...prev,
        { text: "Checking blockchain connections...", type: "output" },
        { text: "Ethereum: CONNECTED", type: "success" },
        { text: "Solana: CONNECTED", type: "success" },
      ])
      setIsProcessing(false)
    } else if (lowerCmd === "clear") {
      setLines([{ text: "Terminal cleared.", type: "output" }])
      setIsProcessing(false)
    } else {
      setLines((prev) => [...prev, { text: `Command not recognized: ${cmd}`, type: "error" }])
      setIsProcessing(false)
    }

    // Clear the input
    setInput("")
  }

  // Auto-scroll to bottom when new lines are added
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [lines])

  return (
    <Card className="bg-black border-gray-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-green-400 flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-green-500 animate-pulse"></span>
          Battle Command Terminal
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          ref={terminalRef}
          className="h-80 overflow-auto font-mono text-sm bg-gray-900 p-4 rounded-md border border-gray-800"
        >
          {lines.map((line, i) => (
            <div
              key={i}
              className={`mb-1 ${
                line.type === "input"
                  ? "text-white"
                  : line.type === "error"
                    ? "text-red-400"
                    : line.type === "success"
                      ? "text-green-400"
                      : "text-gray-400"
              }`}
            >
              {line.text}
            </div>
          ))}
          <div className="flex items-center mt-2">
            <span className="text-green-400 mr-2">{">"}</span>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && input.trim() && !isProcessing) {
                  handleCommand(input)
                }
              }}
              className="bg-transparent border-none outline-none text-white flex-1"
              disabled={isProcessing}
            />
            {isProcessing && <span className="animate-pulse text-yellow-400 ml-2">⟳</span>}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
