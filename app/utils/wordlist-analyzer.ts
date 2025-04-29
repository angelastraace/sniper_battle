import { isValidMnemonic, BIP39_WORDLIST } from "./bip39-utils"

interface AnalysisResult {
  totalWords: number
  uniqueWords: number
  bip39Words: number
  bip39Percentage: number
  potentialPhrases: string[]
  wordFrequency: Record<string, number>
}

/**
 * Analyze a wordlist for BIP39 compatibility and potential seed phrases
 * @param wordlist Array of words to analyze
 * @returns Analysis results
 */
export function analyzeWordlist(wordlist: string[]): AnalysisResult {
  if (!wordlist || !Array.isArray(wordlist) || wordlist.length === 0) {
    return {
      totalWords: 0,
      uniqueWords: 0,
      bip39Words: 0,
      bip39Percentage: 0,
      potentialPhrases: [],
      wordFrequency: {},
    }
  }

  // Clean and normalize words
  const cleanedWords = wordlist.map((word) => word.toLowerCase().trim()).filter((word) => word.length > 0)

  // Count unique words
  const uniqueWords = new Set(cleanedWords)

  // Count BIP39 words
  const bip39Words = cleanedWords.filter((word) => BIP39_WORDLIST.includes(word))

  // Calculate word frequency
  const wordFrequency: Record<string, number> = {}
  for (const word of cleanedWords) {
    wordFrequency[word] = (wordFrequency[word] || 0) + 1
  }

  // Extract potential seed phrases
  const potentialPhrases = extractPotentialSeedPhrases(cleanedWords.join(" "))

  return {
    totalWords: cleanedWords.length,
    uniqueWords: uniqueWords.size,
    bip39Words: bip39Words.length,
    bip39Percentage: cleanedWords.length > 0 ? (bip39Words.length / cleanedWords.length) * 100 : 0,
    potentialPhrases,
    wordFrequency,
  }
}

/**
 * Extract potential seed phrases from a list of words
 * @param text Text containing words to analyze
 * @returns Array of potential seed phrases
 */
export function extractPotentialSeedPhrases(text: string): string[] {
  if (!text) return []

  // Split text into words
  const words = text
    .toLowerCase()
    .replace(/[^\w\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 0)

  // Filter to only include words from the BIP39 wordlist
  const bip39Words = words.filter((word) => BIP39_WORDLIST.includes(word))

  // Find sequences of words that might be seed phrases
  const potentialPhrases: string[] = []

  // Check for valid 12, 15, 18, 21, and 24 word phrases
  const validLengths = [12, 15, 18, 21, 24]

  for (const length of validLengths) {
    if (bip39Words.length >= length) {
      // Use sliding window to check all possible sequences
      for (let i = 0; i <= bip39Words.length - length; i++) {
        const phrase = bip39Words.slice(i, i + length).join(" ")
        if (isValidMnemonic(phrase)) {
          potentialPhrases.push(phrase)
        }
      }
    }
  }

  return potentialPhrases
}
