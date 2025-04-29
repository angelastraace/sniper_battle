/**
 * Phrase Mutation Engine
 * Generates variations of passwords to increase hit rate
 */

// Common mutations to apply to phrases
const MUTATIONS = {
  // Capitalization variations
  capitalization: (phrase) => [
    phrase.toLowerCase(),
    phrase.toUpperCase(),
    phrase.charAt(0).toUpperCase() + phrase.slice(1),
  ],

  // Common number suffixes
  numberSuffixes: (phrase) => [`${phrase}1`, `${phrase}123`, `${phrase}12345`, `${phrase}2023`, `${phrase}2024`],

  // Common symbol suffixes
  symbolSuffixes: (phrase) => [`${phrase}!`, `${phrase}#`, `${phrase}$`, `${phrase}@`, `${phrase}*`],

  // Common letter-to-symbol substitutions
  leetSpeak: (phrase) => [
    phrase.replace(/a/gi, "4"),
    phrase.replace(/e/gi, "3"),
    phrase.replace(/i/gi, "1"),
    phrase.replace(/o/gi, "0"),
    phrase.replace(/s/gi, "5"),
    phrase.replace(/t/gi, "7"),
  ],

  // Combined mutations (common patterns)
  combined: (phrase) => [
    `${phrase}123!`,
    `${phrase.charAt(0).toUpperCase() + phrase.slice(1)}123`,
    `${phrase.charAt(0).toUpperCase() + phrase.slice(1)}!`,
    phrase.replace(/a/gi, "4").replace(/e/gi, "3") + "!",
  ],
}

/**
 * Generate mutations of a phrase based on common password patterns
 * @param phrase The original phrase to mutate
 * @param options Configuration options for mutation
 * @returns Array of mutated phrases
 */
export function generateMutations(phrase, options = {}) {
  // Default options
  const {
    useCapitalization = true,
    useNumbers = true,
    useSymbols = true,
    useLeetSpeak = true,
    useCombined = true,
    maxMutations = 20,
  } = options

  // Start with the original phrase
  const mutations = new Set([phrase])

  // Apply selected mutation types
  if (useCapitalization) {
    MUTATIONS.capitalization(phrase).forEach((m) => mutations.add(m))
  }

  if (useNumbers) {
    MUTATIONS.numberSuffixes(phrase).forEach((m) => mutations.add(m))
  }

  if (useSymbols) {
    MUTATIONS.symbolSuffixes(phrase).forEach((m) => mutations.add(m))
  }

  if (useLeetSpeak) {
    MUTATIONS.leetSpeak(phrase).forEach((m) => mutations.add(m))
  }

  if (useCombined) {
    MUTATIONS.combined(phrase).forEach((m) => mutations.add(m))
  }

  // Convert to array and limit to max mutations
  return Array.from(mutations).slice(0, maxMutations)
}

/**
 * Generate mutations for a list of phrases
 * @param phrases List of original phrases
 * @param options Mutation options
 * @returns Expanded list with mutations
 */
export function mutateAllPhrases(phrases, options = {}) {
  const { maxTotalPhrases = 100000, maxMutationsPerPhrase = 10, ...mutationOptions } = options

  const allMutations = []
  const uniquePhrases = new Set()

  // Process each phrase
  for (const phrase of phrases) {
    // Skip if we've already reached the maximum
    if (uniquePhrases.size >= maxTotalPhrases) break

    // Generate mutations for this phrase
    const mutations = generateMutations(phrase, {
      ...mutationOptions,
      maxMutations: maxMutationsPerPhrase,
    })

    // Add unique mutations
    for (const mutation of mutations) {
      if (!uniquePhrases.has(mutation)) {
        uniquePhrases.add(mutation)
        allMutations.push(mutation)

        // Stop if we've reached the maximum
        if (uniquePhrases.size >= maxTotalPhrases) break
      }
    }
  }

  return allMutations
}
