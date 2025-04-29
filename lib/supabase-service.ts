// Supabase service for database operations

import { createClient } from "@supabase/supabase-js"
import { config } from "./config"

export class SupabaseService {
  private static instance: SupabaseService
  private supabaseClient
  private isInitialized = false

  private constructor() {
    try {
      if (config.supabase.url && config.supabase.serviceRoleKey) {
        this.supabaseClient = createClient(config.supabase.url, config.supabase.serviceRoleKey)
        this.isInitialized = true
        console.log("Supabase client initialized")
      } else {
        console.warn("Supabase configuration is missing. Using mock data instead.")
      }
    } catch (error) {
      console.error("Failed to initialize Supabase client:", error)
    }
  }

  public static getInstance(): SupabaseService {
    if (!SupabaseService.instance) {
      SupabaseService.instance = new SupabaseService()
    }
    return SupabaseService.instance
  }

  public async logScanEvent(data: {
    chain: string
    tokenAddress: string
    eventType: string
    timestamp: number
  }) {
    // If Supabase is not initialized, just log to console and return success
    if (!this.isInitialized || !this.supabaseClient) {
      console.log("Mock logging scan event:", data)
      return true
    }

    try {
      // Check if the table exists first
      const { data: tableExists, error: tableCheckError } = await this.supabaseClient
        .from("scan_events")
        .select("count")
        .limit(1)
        .maybeSingle()

      // If table doesn't exist, log to console and return success
      if (tableCheckError) {
        console.warn("Scan events table may not exist:", tableCheckError.message)
        console.log("Mock logging scan event:", data)
        return true
      }

      // Proceed with insert
      const { error } = await this.supabaseClient.from("scan_events").insert([data])

      if (error) {
        console.error("Error logging scan event:", error.message)
        return false
      }

      return true
    } catch (error) {
      console.error("Failed to log scan event:", error)
      return false
    }
  }

  public async getRecentEvents(limit = 10) {
    // If Supabase is not initialized, return mock data
    if (!this.isInitialized || !this.supabaseClient) {
      return this.getMockEvents(limit)
    }

    try {
      const { data, error } = await this.supabaseClient
        .from("scan_events")
        .select("*")
        .order("timestamp", { ascending: false })
        .limit(limit)

      if (error) {
        console.error("Error fetching recent events:", error.message)
        return this.getMockEvents(limit)
      }

      return data || this.getMockEvents(limit)
    } catch (error) {
      console.error("Failed to fetch recent events:", error)
      return this.getMockEvents(limit)
    }
  }

  // Generate mock events for fallback
  private getMockEvents(limit: number) {
    const mockEvents = []
    const now = Date.now()
    const chains = ["ethereum", "solana", "bsc"]
    const eventTypes = ["token_detected", "wallet_funded", "snipe_executed", "scan_completed"]

    for (let i = 0; i < limit; i++) {
      mockEvents.push({
        id: i,
        chain: chains[Math.floor(Math.random() * chains.length)],
        tokenAddress: `0x${Math.random().toString(16).substring(2, 10)}...`,
        eventType: eventTypes[Math.floor(Math.random() * eventTypes.length)],
        timestamp: now - i * 60000, // Each event is 1 minute apart
      })
    }

    return mockEvents
  }
}
