"use client"

export interface SniperStatus {
  isActive: boolean
  targetAcquisition: string
  executionSpeed: string
  defenseSystems: string
  powerLevel: string
  lastActivated: number | null
  activatedBy: string | null
}

export interface SniperMetrics {
  successRate: string
  responseTime: string
  profitMargin: string
  lastUpdated: number
}

export interface SniperTarget {
  id: string
  address: string
  network: string
  balance: string
  lastSeen: number
  status: "pending" | "active" | "completed" | "failed"
}

export class SniperService {
  private static instance: SniperService
  private status: SniperStatus = {
    isActive: false,
    targetAcquisition: "READY",
    executionSpeed: "TURBO",
    defenseSystems: "ACTIVE",
    powerLevel: "100%",
    lastActivated: null,
    activatedBy: null,
  }
  private metrics: SniperMetrics = {
    successRate: "98.7",
    responseTime: "0.42",
    profitMargin: "24.5",
    lastUpdated: Date.now(),
  }
  private logs: string[] = []
  private listeners: (() => void)[] = []

  private constructor() {
    console.log("Initializing sniper service")
  }

  public static getInstance(): SniperService {
    if (!SniperService.instance) {
      SniperService.instance = new SniperService()
    }
    return SniperService.instance
  }

  public activateSniper() {
    this.status = {
      ...this.status,
      isActive: true,
      targetAcquisition: "HUNTING",
      lastActivated: Date.now(),
      activatedBy: "User",
    }
    this.log("🚀 Sniper activated and hunting for targets!")
    this.notifyListeners()
  }

  public emergencyStop() {
    this.status = {
      ...this.status,
      isActive: false,
      targetAcquisition: "READY",
    }
    this.log("🛑 Sniper emergency stopped!")
    this.notifyListeners()
  }

  public getStatus(): SniperStatus {
    return { ...this.status }
  }

  public getMetrics(): SniperMetrics {
    return { ...this.metrics }
  }

  public getLogs(): string[] {
    return [...this.logs]
  }

  private log(message: string) {
    const timestamp = new Date().toLocaleTimeString()
    this.logs.push(`[${timestamp}] ${message}`)
    if (this.logs.length > 10) {
      this.logs.shift()
    }
  }

  public subscribe(callback: () => void): () => void {
    this.listeners.push(callback)
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback)
    }
  }

  private notifyListeners() {
    this.listeners.forEach((listener) => listener())
  }
}

export default SniperService
export type { SniperStatus, SniperMetrics }
