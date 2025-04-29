export default function mutatePhrase(phrase) {
  const mutations = new Set()

  // Basic forms
  mutations.add(phrase)
  mutations.add(phrase.toUpperCase())
  mutations.add(phrase.toLowerCase())
  mutations.add(phrase[0].toUpperCase() + phrase.slice(1).toLowerCase())

  // Common leetspeak replacements
  const leetMap = { a: "4", e: "3", i: "1", o: "0", s: "5", t: "7" }
  const leet = phrase
    .toLowerCase()
    .split("")
    .map((char) => leetMap[char] || char)
    .join("")
  mutations.add(leet)
  mutations.add(leet.toUpperCase())

  // Common suffixes
  const suffixes = ["123", "1q2w3e4r", "!", "111", "000", "31415926"]
  suffixes.forEach((suffix) => {
    mutations.add(phrase + suffix)
    mutations.add(phrase.toUpperCase() + suffix)
    mutations.add(leet + suffix)
  })

  // Reversed
  mutations.add(phrase.split("").reverse().join(""))

  // Capitalize all permutations of first letter only
  if (phrase.length > 1) {
    mutations.add(phrase[0].toUpperCase() + phrase.slice(1))
    mutations.add(phrase[0].toLowerCase() + phrase.slice(1).toUpperCase())
  }

  return Array.from(mutations)
}
