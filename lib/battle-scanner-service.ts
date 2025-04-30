import { WebSocket, WebSocketServer } from "ws"
import BlockchainApiService from "./blockchain-api-service"
import type { Connection } from "@solana/web3.js"

// Define battle types
export type BattleType = "mint" | "liquidity" | "swap" | "target_wallet"

// Define battle target structure
export interface BattleTarget {
  id: string
  token?: string
  tokenAddress?: string
  slot: number
  type: BattleType
  time: number
  details?: any
  status: "detected" | "active" | "completed" | "failed"
}

class BattleScannerService {
  private static instance: BattleScannerService
  private wss: WebSocketServer | null = null
  private targets: BattleTarget[] = []
  private blockchainService: BlockchainApiService
  private solanaConnection: Connection | null = null
  private isRunning = false
  private wsPort: number

  private constructor() {
    this.blockchainService = BlockchainApiService.getInstance()
    this.wsPort = Number.parseInt(process.env.WS_STATS_PORT || "3001", 10)

    // Initialize targets array (could be loaded from persistent storage)
    this.targets = []
  }

  public static getInstance(): BattleScannerService {
    if (!BattleScannerService.instance) {
      BattleScannerService.instance = new BattleScannerService()
    }
    return BattleScannerService.instance
  }

  public start(): void {
    if (this.isRunning) return

    console.log("🔍 Starting Battle Scanner service...")
    this.isRunning = true

    // Initialize WebSocket server if in Node.js environment
    if (typeof window === "undefined") {
      try {
        this.wss = new WebSocketServer({ port: this.wsPort })

        this.wss.on("connection", (ws) => {
          console.log("🛰️ Frontend connected to Battle Scanner")

          // Send current targets on connect
          ws.send(JSON.stringify(this.targets))

          // Handle messages from clients
          ws.on("message", (message) => {
            try {
              const data = JSON.parse(message.toString())
              this.handleClientMessage(data, ws)
            } catch (error) {
              console.error("Error processing WebSocket message:", error)
            }
          })
        })

        console.log(`🚀 Battle Scanner WebSocket server running on port ${this.wsPort}`)
      } catch (error) {
        console.error("Failed to start WebSocket server:", error)
      }
    }

    // Subscribe to Solana blocks to detect battles
    this.subscribeToBattleEvents()
  }

  private subscribeToBattleEvents(): void {
    // Get Solana connection from blockchain service
    this.solanaConnection = this.blockchainService.getSolanaConnection()

    if (!this.solanaConnection) {
      console.error("Cannot start Battle Scanner: No Solana connection")
      return
    }

    // Subscribe to new blocks via the blockchain service
    this.blockchainService.subscribeToSolanaBlocks(async (blocks) => {
      if (blocks.length === 0) return

      // Get the latest block
      const latestBlock = blocks[0]

      // Fetch full block data to analyze
      try {
        const blockData = await this.solanaConnection?.getBlock(Number(latestBlock.number), {
          maxSupportedTransactionVersion: 0,
        })

        if (blockData) {
          this.scanBlockForBattles(blockData, Number(latestBlock.number))
        }
      } catch (error) {
        console.error(`Error fetching block data for battle scanning: ${error}`)
      }
    })

    console.log("🔍 Subscribed to Solana blocks for battle detection")
  }

  private scanBlockForBattles(block: any, slot: number): void {
    console.log(`🔍 Scanning block ${slot} for battles (${block.transactions.length} transactions)`)

    for (const tx of block.transactions) {
      // Scan for SPL Token Mints
      this.detectTokenMints(tx, slot)

      // Scan for Liquidity Events (Raydium/Orca)
      this.detectLiquidityEvents(tx, slot)

      // Scan for Large Swaps
      this.detectLargeSwaps(tx, slot)

      // Scan for Target Wallet Activity
      this.detectTargetWalletActivity(tx, slot)
    }
  }

  private detectTokenMints(tx: any, slot: number): void {
    for (const ix of tx.transaction.message.instructions) {
      try {
        const programId = ix.programId.toBase58()

        // Detect SPL Token Mint
        if (programId === "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA") {
          const data = Buffer.from(ix.data, "base64").toString("hex")
          const mintInstruction = data.slice(0, 2)

          if (mintInstruction === "00") {
            // Extract more details about the mint
            const mintAddress = tx.transaction.message.accountKeys[ix.accounts[0]].toBase58()
            const mintAuthority = tx.transaction.message.accountKeys[ix.accounts[1]].toBase58()

            console.log(`🎯 SPL Token Mint Detected in Slot ${slot}`)
            console.log(`   Mint Address: ${mintAddress}`)
            console.log(`   Mint Authority: ${mintAuthority}`)

            // Create a battle target
            const target: BattleTarget = {
              id: `mint-${mintAddress}-${slot}`,
              tokenAddress: mintAddress,
              slot,
              type: "mint",
              time: Date.now(),
              status: "detected",
              details: {
                mintAuthority,
                signature: tx.transaction.signatures[0],
              },
            }

            // Add to targets and broadcast
            this.addTarget(target)
          }
        }
      } catch (err) {
        // Silently skip parsing failures
      }
    }
  }

  private detectLiquidityEvents(tx: any, slot: number): void {
    for (const ix of tx.transaction.message.instructions) {
      try {
        const programId = ix.programId.toBase58()

        // Detect Raydium Liquidity
        if (programId === "675kPX9MHTjS2zt1qfr1NYHuzeLXfQM9H24wFSUt1Mp8") {
          console.log(`💧 Raydium Liquidity Event Detected in Slot ${slot}`)

          // Create a battle target
          const target: BattleTarget = {
            id: `liquidity-raydium-${slot}-${tx.transaction.signatures[0].slice(0, 8)}`,
            slot,
            type: "liquidity",
            time: Date.now(),
            status: "detected",
            details: {
              dex: "Raydium",
              signature: tx.transaction.signatures[0],
            },
          }

          // Add to targets and broadcast
          this.addTarget(target)
        }

        // Detect Orca Liquidity
        if (programId === "9W959DqEETiGZocYWCQPaJ6sBmUzgfxXfqGeTEdp3aQP") {
          console.log(`💧 Orca Liquidity Event Detected in Slot ${slot}`)

          // Create a battle target
          const target: BattleTarget = {
            id: `liquidity-orca-${slot}-${tx.transaction.signatures[0].slice(0, 8)}`,
            slot,
            type: "liquidity",
            time: Date.now(),
            status: "detected",
            details: {
              dex: "Orca",
              signature: tx.transaction.signatures[0],
            },
          }

          // Add to targets and broadcast
          this.addTarget(target)
        }
      } catch (err) {
        // Silently skip parsing failures
      }
    }
  }

  private detectLargeSwaps(tx: any, slot: number): void {
    // Implementation for detecting large swaps (Jupiter, etc.)
    // This is a simplified placeholder
    for (const ix of tx.transaction.message.instructions) {
      try {
        const programId = ix.programId.toBase58()

        // Detect Jupiter swaps
        if (programId === "JUP4Fb2cqiRUcaTHdrPC8h2gNsA2ETXiPDD33WcGuJB") {
          console.log(`🐋 Jupiter Swap Detected in Slot ${slot}`)

          // Create a battle target for significant swaps
          // In a real implementation, you'd check the swap amount
          const target: BattleTarget = {
            id: `swap-jupiter-${slot}-${tx.transaction.signatures[0].slice(0, 8)}`,
            slot,
            type: "swap",
            time: Date.now(),
            status: "detected",
            details: {
              platform: "Jupiter",
              signature: tx.transaction.signatures[0],
            },
          }

          // Add to targets and broadcast
          this.addTarget(target)
        }
      } catch (err) {
        // Silently skip parsing failures
      }
    }
  }

  private detectTargetWalletActivity(tx: any, slot: number): void {
    // Implementation for detecting activity from specific wallets
    // This would check if any of the transaction signers are in a watchlist

    // Example: Check if a specific wallet is involved
    const targetWallets = [
      // Add wallets you want to monitor here
      // 'FZLTRwrxqfJqUVK8j2B4House6QYQwGxSBU3hUuThRQ'
    ]

    if (targetWallets.length === 0) return

    try {
      const signers = tx.transaction.message.accountKeys
        .filter((_, idx) => tx.transaction.message.isAccountSigner(idx))
        .map((key) => key.toBase58())

      for (const wallet of targetWallets) {
        if (signers.includes(wallet)) {
          console.log(`🎯 Target Wallet Activity Detected: ${wallet} in Slot ${slot}`)

          // Create a battle target
          const target: BattleTarget = {
            id: `wallet-${wallet}-${slot}-${tx.transaction.signatures[0].slice(0, 8)}`,
            slot,
            type: "target_wallet",
            time: Date.now(),
            status: "detected",
            details: {
              wallet,
              signature: tx.transaction.signatures[0],
            },
          }

          // Add to targets and broadcast
          this.addTarget(target)
          break
        }
      }
    } catch (err) {
      // Silently skip parsing failures
    }
  }

  private addTarget(target: BattleTarget): void {
    // Add to targets array
    this.targets.push(target)

    // Keep array at reasonable size
    if (this.targets.length > 100) {
      this.targets = this.targets.slice(-100)
    }

    // Broadcast to all connected clients
    this.broadcastTarget(target)

    console.log(`🚨 New battle target detected: ${target.type} in slot ${target.slot}`)
  }

  private broadcastTarget(target: BattleTarget): void {
    if (!this.wss) return

    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify([target]))
      }
    })
  }

  private handleClientMessage(data: any, ws: WebSocket): void {
    // Handle client messages like activating targets, etc.
    if (data.action === "getTargets") {
      ws.send(JSON.stringify(this.targets))
    }
  }

  public getTargets(): BattleTarget[] {
    return this.targets
  }

  public stop(): void {
    if (!this.isRunning) return

    console.log("Stopping Battle Scanner service...")

    // Close WebSocket server
    if (this.wss) {
      this.wss.close()
      this.wss = null
    }

    this.isRunning = false
  }
}

export default BattleScannerService
