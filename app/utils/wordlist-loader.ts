/**
 * Enhanced Wordlist Loader Utility for SOL Sniper V2
 * Handles loading wordlists from remote sources with caching
 */

const CACHE_KEY = "sol_sniper_wordlist_cache"
const CACHE_EXPIRY = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

/**
 * Load a wordlist from a remote URL
 * @param {string} url - URL to fetch wordlist from
 * @param {boolean} useCache - Whether to use cached version if available
 * @returns {Promise<string[]>} Array of phrases
 */
export async function loadRemoteWordlist(url: string, useCache = true): Promise<string[]> {
  // Check cache first if enabled
  if (useCache) {
    const cachedData = getCachedWordlist(url)
    if (cachedData) {
      console.log("Using cached wordlist")
      return cachedData.wordlist
    }
  }

  try {
    console.log(`Fetching wordlist from ${url}`)
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json, text/plain",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch wordlist: ${response.status} ${response.statusText}`)
    }

    // Check content type to determine how to parse
    const contentType = response.headers.get("content-type") || ""
    let wordlist: string[] = []

    if (contentType.includes("application/json")) {
      // Parse as JSON
      const data = await response.json()
      wordlist = Array.isArray(data) ? data : data.wordlist || data.words || data.phrases || []
    } else {
      // Parse as text (one phrase per line)
      const text = await response.text()
      wordlist = text.split(/\r?\n/).filter((line) => line.trim() !== "")
    }

    if (wordlist.length === 0) {
      throw new Error("Invalid wordlist format or empty wordlist")
    }

    // Cache the wordlist
    cacheWordlist(url, wordlist)

    return wordlist
  } catch (error) {
    console.error("Error loading remote wordlist:", error)

    // Return cached data as fallback even if useCache was false
    const cachedData = getCachedWordlist(url)
    if (cachedData) {
      console.log("Falling back to cached wordlist due to error")
      return cachedData.wordlist
    }

    throw error
  }
}

/**
 * Load a wordlist from a text file
 * @param {File} file - File object to load
 * @returns {Promise<string[]>} Array of phrases
 */
export function loadWordlistFromFile(file: File): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const content = e.target?.result
        if (typeof content !== "string") {
          reject(new Error("Invalid file content"))
          return
        }

        let wordlist: string[] = []

        // Try to parse as JSON first
        try {
          const data = JSON.parse(content)
          wordlist = Array.isArray(data) ? data : data.wordlist || data.words || data.phrases || []
        } catch {
          // If not JSON, treat as text file with one phrase per line
          wordlist = content.split(/\r?\n/).filter((line) => line.trim() !== "")
        }

        if (wordlist.length === 0) {
          reject(new Error("No valid phrases found in file"))
          return
        }

        resolve(wordlist)
      } catch (error) {
        reject(error)
      }
    }

    reader.onerror = () => {
      reject(new Error("Error reading file"))
    }

    reader.readAsText(file)
  })
}

/**
 * Cache a wordlist in localStorage
 * @param {string} url - Source URL of the wordlist
 * @param {string[]} wordlist - Array of phrases to cache
 */
function cacheWordlist(url: string, wordlist: string[]): void {
  try {
    const cacheData = {
      url,
      wordlist,
      timestamp: Date.now(),
    }

    const cacheStore = JSON.parse(localStorage.getItem(CACHE_KEY) || "{}")
    cacheStore[url] = cacheData

    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheStore))
    console.log(`Cached wordlist from ${url} with ${wordlist.length} phrases`)
  } catch (error) {
    console.error("Error caching wordlist:", error)
  }
}

/**
 * Get a cached wordlist if available and not expired
 * @param {string} url - Source URL of the wordlist
 * @returns {Object|null} Cached data or null if not available
 */
function getCachedWordlist(url: string): { url: string; wordlist: string[]; timestamp: number } | null {
  try {
    const cacheStore = JSON.parse(localStorage.getItem(CACHE_KEY) || "{}")
    const cachedData = cacheStore[url]

    if (!cachedData) return null

    // Check if cache is expired
    if (Date.now() - cachedData.timestamp > CACHE_EXPIRY) {
      console.log("Cached wordlist is expired")
      return null
    }

    return cachedData
  } catch (error) {
    console.error("Error retrieving cached wordlist:", error)
    return null
  }
}

/**
 * Clear all cached wordlists
 */
export function clearWordlistCache(): void {
  localStorage.removeItem(CACHE_KEY)
  console.log("Wordlist cache cleared")
}

/**
 * Get information about all cached wordlists
 * @returns {Object} Cache info object
 */
export function getWordlistCacheInfo(): {
  totalCached: number
  totalWords: number
  cacheSize: number
  items: Array<{
    url: string
    wordCount: number
    timestamp: number
    age: number
    isExpired: boolean
  }>
} {
  try {
    const cacheStore = JSON.parse(localStorage.getItem(CACHE_KEY) || "{}")
    const items = Object.entries(cacheStore).map(([url, data]: [string, any]) => ({
      url,
      wordCount: data.wordlist.length,
      timestamp: data.timestamp,
      age: Math.floor((Date.now() - data.timestamp) / (60 * 1000)), // Age in minutes
      isExpired: Date.now() - data.timestamp > CACHE_EXPIRY,
    }))

    return {
      totalCached: items.length,
      totalWords: items.reduce((sum, item) => sum + item.wordCount, 0),
      cacheSize: Math.round(JSON.stringify(cacheStore).length / 1024), // Approximate size in KB
      items,
    }
  } catch (error) {
    console.error("Error getting cache info:", error)
    return {
      totalCached: 0,
      totalWords: 0,
      cacheSize: 0,
      items: [],
    }
  }
}

/**
 * Combine multiple wordlists and remove duplicates
 * @param {Array<string[]>} wordlists - Array of wordlist arrays
 * @returns {string[]} Combined wordlist with duplicates removed
 */
export function combineWordlists(wordlists: string[][]): string[] {
  // Flatten all wordlists into a single array
  const allPhrases = wordlists.flat()

  // Remove duplicates using Set
  return [...new Set(allPhrases)]
}
