import * as bip39 from "bip39"

// Export the BIP39 wordlist
export const BIP39_WORDLIST = bip39.wordlists.english

/**
 * Generate a random BIP39 mnemonic phrase
 * @param strength Optional strength in bits (128, 160, 192, 224, 256)
 * @returns A random mnemonic phrase
 */
export function generateMnemonic(strength = 128): string {
  return bip39.generateMnemonic(strength)
}

/**
 * Validate if a phrase is a valid BIP39 mnemonic
 * @param phrase The phrase to validate
 * @returns True if valid, false otherwise
 */
export function isValidMnemonic(phrase: string): boolean {
  return bip39.validateMnemonic(phrase)
}

/**
 * Create combinations of words that might form valid seed phrases
 * @param words Array of words to combine
 * @param minLength Minimum number of words in combination
 * @param maxLength Maximum number of words in combination
 * @returns Array of potential seed phrases
 */
export function createWordCombinations(words: string[], minLength = 12, maxLength = 24): string[] {
  if (!words || words.length < minLength) {
    return []
  }

  const validLengths = [12, 15, 18, 21, 24]
  const filteredLengths = validLengths.filter((length) => length >= minLength && length <= maxLength)

  if (filteredLengths.length === 0) {
    return []
  }

  // Filter words to only include those in the BIP39 wordlist
  const validWords = words.filter((word) => BIP39_WORDLIST.includes(word.toLowerCase().trim()))

  if (validWords.length < minLength) {
    return []
  }

  // For simplicity and performance, we'll just create sequential combinations
  // rather than all possible combinations (which would be exponential)
  const combinations: string[] = []

  // For each valid length
  for (const length of filteredLengths) {
    // If we have enough words
    if (validWords.length >= length) {
      // Create sliding window combinations
      for (let i = 0; i <= validWords.length - length; i++) {
        const combination = validWords.slice(i, i + length).join(" ")
        if (isValidMnemonic(combination)) {
          combinations.push(combination)
        }
      }
    }
  }

  return combinations
}

/**
 * Extract potential seed phrases from a text
 * @param text Text to analyze
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
