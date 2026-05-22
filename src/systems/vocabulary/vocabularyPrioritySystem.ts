import type { VocabularyExplanationContract } from "@/contracts/vocabulary-contract"
import { VOCABULARY_PREPARATION_CONFIG } from "@/config/vocabularyPreparationConfig"

const IMPORTANCE_RANK: Record<
  VocabularyExplanationContract["importance"],
  number
> = {
  HIGH: 0,
  MEDIUM: 1,
  LOW: 2,
}

export function sortVocabularyByPriority(
  explanations: VocabularyExplanationContract[]
): VocabularyExplanationContract[] {
  return [...explanations].sort(
    (a, b) => IMPORTANCE_RANK[a.importance] - IMPORTANCE_RANK[b.importance]
  )
}

/** Score calculation — weights critical unknowns more heavily. */
export function prioritizeCriticalVocabulary(
  explanations: VocabularyExplanationContract[]
): VocabularyExplanationContract[] {
  return sortVocabularyByPriority(explanations).filter(
    (e) => e.importance !== "LOW"
  )
}

/** Briefing display — all unknown targets, capped for readability. */
export function vocabularyForBriefingDisplay(
  explanations: VocabularyExplanationContract[],
  maxWords = VOCABULARY_PREPARATION_CONFIG.MAX_BRIEFING_WORDS
): VocabularyExplanationContract[] {
  return sortVocabularyByPriority(explanations).slice(0, maxWords)
}
