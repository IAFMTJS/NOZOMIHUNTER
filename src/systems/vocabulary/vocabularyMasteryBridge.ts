import type { WordMastery } from "./vocabularyMasterySystem"
import { VOCABULARY_PREPARATION_CONFIG } from "@/config/vocabularyPreparationConfig"

/** Maps numeric mastery (0–100) from masterySystem to preparation tiers. */
export function numericMasteryToTier(mastery: number): WordMastery {
  if (mastery >= 80) return "MASTERED"
  if (mastery >= 60) return "CONFIDENT"
  if (mastery >= 40) return "UNDERSTOOD"
  if (mastery >= 20) return "RECOGNIZED"
  if (mastery > 0) return "SEEN"
  return "UNKNOWN"
}

export function isUnknownForPreparation(mastery: number): boolean {
  return mastery < VOCABULARY_PREPARATION_CONFIG.UNKNOWN_MASTERY_THRESHOLD
}
