"use client"

interface CachedData<T> {
  data: T
  timestamp: number
}

// Cache expiration time in milliseconds (5 minutes)
const CACHE_EXPIRATION = 5 * 60 * 1000

class BlockchainCache {
  private static instance: BlockchainCache
  private cache: Map<string, CachedData<any>> = new Map()

  private constructor() {}

  public static getInstance(): BlockchainCache {
    if (!BlockchainCache.instance) {
      BlockchainCache.instance = new BlockchainCache()
    }
    return BlockchainCache.instance
  }

  private getCacheKey(network: string, method: string, params: any[]): string {
    return `${network}:${method}:${JSON.stringify(params)}`
  }

  private isCacheValid<T>(cachedData: CachedData<T> | undefined): boolean {
    if (!cachedData) return false
    return Date.now() - cachedData.timestamp < CACHE_EXPIRATION
  }

  public async getEthereumData<T>(method: string, params: any[] = [], fetchFn: () => Promise<T>): Promise<T> {
    const cacheKey = this.getCacheKey("ethereum", method, params)
    const cachedData = this.cache.get(cacheKey) as CachedData<T> | undefined

    if (this.isCacheValid(cachedData)) {
      return cachedData.data
    }

    const data = await fetchFn()
    this.cache.set(cacheKey, { data, timestamp: Date.now() })
    return data
  }

  public async getSolanaData<T>(method: string, params: any[] = [], fetchFn: () => Promise<T>): Promise<T> {
    const cacheKey = this.getCacheKey("solana", method, params)
    const cachedData = this.cache.get(cacheKey) as CachedData<T> | undefined

    if (this.isCacheValid(cachedData)) {
      return cachedData.data
    }

    const data = await fetchFn()
    this.cache.set(cacheKey, { data, timestamp: Date.now() })
    return data
  }

  public async getBscData<T>(method: string, params: any[] = [], fetchFn: () => Promise<T>): Promise<T> {
    const cacheKey = this.getCacheKey("bsc", method, params)
    const cachedData = this.cache.get(cacheKey) as CachedData<T> | undefined

    if (this.isCacheValid(cachedData)) {
      return cachedData.data
    }

    const data = await fetchFn()
    this.cache.set(cacheKey, { data, timestamp: Date.now() })
    return data
  }

  public clearCache(): void {
    this.cache.clear()
  }

  public invalidateCache(network: string, method: string, params: any[] = []): void {
    const cacheKey = this.getCacheKey(network, method, params)
    this.cache.delete(cacheKey)
  }

  private async fetchDataWithFallback<T>(
    primaryFetch: () => Promise<T>,
    backupFetch: () => Promise<T>,
    cacheKey: string,
    expiryTime: number,
  ): Promise<T> {
    try {
      // Try primary fetch
      const data = await primaryFetch()
      this.updateCache(cacheKey, data, expiryTime)
      return data
    } catch (primaryError) {
      console.error(`Primary fetch failed for ${cacheKey}:`, primaryError)

      try {
        // Try backup fetch
        const backupData = await backupFetch()
        this.updateCache(cacheKey, backupData, expiryTime)
        return backupData
      } catch (backupError) {
        console.error(`Backup fetch failed for ${cacheKey}:`, backupError)

        // Check if we have cached data
        const cachedData = this.getFromCache<T>(cacheKey)
        if (cachedData) {
          console.log(`Using cached data for ${cacheKey}`)
          return cachedData
        }

        // If all else fails, throw the error
        throw backupError
      }
    }
  }

  private updateCache<T>(cacheKey: string, data: T, expiryTime: number): void {
    this.cache.set(cacheKey, { data, timestamp: Date.now() })
  }

  private getFromCache<T>(cacheKey: string): T | undefined {
    const cachedData = this.cache.get(cacheKey) as CachedData<T> | undefined
    if (this.isCacheValid(cachedData)) {
      return cachedData.data
    }
    return undefined
  }
}

export default BlockchainCache.getInstance()
