import type { AIMemoryContract } from "@/contracts/ai-contract"

export function createEmptyMemory(): AIMemoryContract {
  return {
    rememberedWords: [],
    weakGrammarPatterns: [],
    recentMistakes: [],
    relationshipLevel: 0,
  }
}

export function updateMemory(
  memory: AIMemoryContract,
  words: string[],
  mistakes: string[]
): AIMemoryContract {
  return {
    rememberedWords: [...new Set([...memory.rememberedWords, ...words])].slice(
      -100
    ),
    weakGrammarPatterns: memory.weakGrammarPatterns,
    recentMistakes: [...mistakes, ...memory.recentMistakes].slice(0, 20),
    relationshipLevel: Math.min(100, memory.relationshipLevel + 1),
  }
}
