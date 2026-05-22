import type { VocabularyExplanationContract } from "@/contracts/vocabulary-contract"
import { getVocabularyCatalog } from "@/systems/mastery/vocabularyCatalog"

export type VocabularyExplanation = VocabularyExplanationContract

function importanceFromFrequencyTier(tier: number): VocabularyExplanation["importance"] {
  if (tier <= 2) return "HIGH"
  if (tier <= 4) return "MEDIUM"
  return "LOW"
}

export function generateVocabularyExplanation(
  word: string
): VocabularyExplanation {
  return {
    kanji: word,
    romaji: word,
    meaning: "Mission vocabulary",
    context: "Used during this contract.",
    importance: "MEDIUM",
  }
}

export function generateVocabularyExplanationForWord(
  wordId: string
): VocabularyExplanation {
  const entry = getVocabularyCatalog().byId.get(wordId)
  if (!entry) {
    return generateVocabularyExplanation(wordId)
  }

  const kanji = entry.japanese[0] ?? entry.reading[0] ?? wordId
  return {
    kanji,
    romaji: entry.romaji,
    meaning: entry.meanings[0] ?? "—",
    context: "Appears in this contract's encounter targets.",
    importance: importanceFromFrequencyTier(entry.frequencyTier),
  }
}