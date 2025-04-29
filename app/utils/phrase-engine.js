/**
 * Advanced Phrase Mutation Engine for SOL Sniper V2
 * Generates high-quality mutations of seed phrases to increase hit rate
 */

// Common number suffixes people use in passwords
const COMMON_SUFFIXES = ["123", "1234", "12345", "123456", "2023", "2024", "!", "!!", "@", "#", "$", "1", "01", "007"]

// Common prefixes people use
const COMMON_PREFIXES = ["my", "the", "a", "best", "top", "new", "old", "secret", "private", "main"]

// Leet speak character map
const LEET_MAP = {
  a: "4",
  b: "8",
  e: "3",
  g: "6",
  i: "1",
  l: "1",
  o: "0",
  s: "5",
  t: "7",
  z: "2",
}

/**
 * Generate mutations of a phrase
 * @param {string} phrase - Original phrase to mutate
 * @param {Object} options - Mutation options
 * @returns {string[]} Array of mutated phrases
 */
export function mutatePhrase(phrase, options = {}) {
  const {
    useLeetSpeak = true,
    useCaseVariations = true,
    useReverse = true,
    useSuffixes = true,
    usePrefixes = true,
    useWordReplacements = true,
    maxMutations = 20, // Limit total mutations to prevent excessive scanning
  } = options

  if (!phrase || typeof phrase !== "string") {
    return []
  }

  const mutations = new Set([phrase]) // Start with original phrase

  // Basic case variations
  if (useCaseVariations) {
    mutations.add(phrase.toLowerCase())
    mutations.add(phrase.toUpperCase())
    mutations.add(phrase.charAt(0).toUpperCase() + phrase.slice(1).toLowerCase()) // Title case
  }

  // Add common suffixes
  if (useSuffixes) {
    COMMON_SUFFIXES.forEach((suffix) => {
      mutations.add(phrase + suffix)
      if (useCaseVariations) {
        mutations.add(phrase.toLowerCase() + suffix)
        mutations.add(phrase.toUpperCase() + suffix)
      }
    })
  }

  // Add common prefixes
  if (usePrefixes) {
    COMMON_PREFIXES.forEach((prefix) => {
      mutations.add(prefix + phrase)
      if (useCaseVariations) {
        mutations.add(prefix + phrase.toLowerCase())
        mutations.add(prefix.toUpperCase() + phrase.toUpperCase())
      }
    })
  }

  // Leet speak variations
  if (useLeetSpeak) {
    let leetPhrase = phrase.toLowerCase()
    for (const [char, replacement] of Object.entries(LEET_MAP)) {
      leetPhrase = leetPhrase.replace(new RegExp(char, "g"), replacement)
    }
    mutations.add(leetPhrase)

    // Combine leet speak with suffixes
    if (useSuffixes) {
      COMMON_SUFFIXES.slice(0, 3).forEach((suffix) => {
        mutations.add(leetPhrase + suffix)
      })
    }
  }

  // Reverse the phrase
  if (useReverse) {
    const reversed = phrase.split("").reverse().join("")
    mutations.add(reversed)

    // Add some suffixes to reversed phrase
    if (useSuffixes) {
      mutations.add(reversed + "123")
      mutations.add(reversed + "!")
    }
  }

  // Word replacements (common in crypto)
  if (useWordReplacements) {
    const replacements = {
      wallet: "wallets",
      crypto: "cryptos",
      bitcoin: "btc",
      ethereum: "eth",
      solana: "sol",
      password: "pass",
    }

    for (const [original, replacement] of Object.entries(replacements)) {
      if (phrase.toLowerCase().includes(original)) {
        const newPhrase = phrase.toLowerCase().replace(original, replacement)
        mutations.add(newPhrase)

        // Add some suffixes to replaced words
        if (useSuffixes) {
          mutations.add(newPhrase + "123")
        }
      }
    }
  }

  // Convert Set to Array and limit the number of mutations
  return [...mutations].slice(0, maxMutations)
}

/**
 * Generate a batch of phrases for scanning
 * @param {Object} options - Batch generation options
 * @returns {string[]} Array of phrases to scan
 */
export function generatePhraseBatch(options = {}) {
  const {
    baseWords = [],
    useWordCombos = true,
    wordComboLength = 2,
    useTyposquats = true,
    useCaseVariations = true,
    useLeetSpeak = true,
    useSuffixes = true,
    batchSize = 50,
  } = options

  if (baseWords.length === 0) {
    return []
  }

  const results = new Set()

  // Add some base words directly
  for (let i = 0; i < Math.min(baseWords.length, batchSize / 4); i++) {
    const randomIndex = Math.floor(Math.random() * baseWords.length)
    results.add(baseWords[randomIndex])
  }

  // Generate word combinations if enabled
  if (useWordCombos && baseWords.length >= 2) {
    for (let i = 0; i < batchSize / 4; i++) {
      const combo = []
      for (let j = 0; j < wordComboLength; j++) {
        const randomIndex = Math.floor(Math.random() * baseWords.length)
        combo.push(baseWords[randomIndex])
      }
      results.add(combo.join(" "))
    }
  }

  // Generate typosquats if enabled
  if (useTyposquats) {
    for (let i = 0; i < batchSize / 4; i++) {
      const randomIndex = Math.floor(Math.random() * baseWords.length)
      const word = baseWords[randomIndex]

      if (word.length <= 3) continue

      // Simple typo: swap two adjacent characters
      const pos = Math.floor(Math.random() * (word.length - 1))
      const chars = word.split("")
      ;[chars[pos], chars[pos + 1]] = [chars[pos + 1], chars[pos]]
      results.add(chars.join(""))
    }
  }

  // Apply mutations to existing phrases to fill the batch
  const existingPhrases = [...results]
  for (const phrase of existingPhrases) {
    if (results.size >= batchSize) break

    const mutations = mutatePhrase(phrase, {
      useLeetSpeak,
      useCaseVariations,
      useSuffixes,
      maxMutations: 3, // Limit mutations per phrase
    })

    for (const mutation of mutations) {
      results.add(mutation)
      if (results.size >= batchSize) break
    }
  }

  return [...results].slice(0, batchSize)
}

/**
 * Analyze a phrase for potential quality as a wallet seed
 * @param {string} phrase - Phrase to analyze
 * @returns {number} Score from 0-100 indicating likelihood of being a wallet seed
 */
export function analyzePhrase(phrase) {
  if (!phrase || typeof phrase !== "string") {
    return 0
  }

  let score = 50 // Start with neutral score

  // Length factors
  if (phrase.length < 4) score -= 20
  if (phrase.length > 8) score += 10
  if (phrase.length > 12) score += 5

  // Complexity factors
  if (/[A-Z]/.test(phrase)) score += 5 // Has uppercase
  if (/[a-z]/.test(phrase)) score += 5 // Has lowercase
  if (/[0-9]/.test(phrase)) score += 10 // Has numbers
  if (/[^A-Za-z0-9]/.test(phrase)) score += 15 // Has special chars

  // Common patterns
  if (/password|123456|qwerty|admin/i.test(phrase)) score += 20 // Common passwords
  if (/wallet|crypto|bitcoin|ethereum|solana|key|seed|phrase/i.test(phrase)) score += 25 // Crypto terms
  if (/private|secret|backup|recovery/i.test(phrase)) score += 15 // Security terms

  // Negative patterns
  if (/test|example|demo/i.test(phrase)) score -= 15 // Test phrases

  // Ensure score is between 0-100
  return Math.max(0, Math.min(100, score))
}
