import type { QuestDifficulty } from "@/contracts/quest-contract"

export const SPEECH_ENCOUNTER_CONFIG = {
  DEFAULT_PHRASE_COUNT: 4,
  MAX_WRONG_ATTEMPTS: 4,
  MIN_RESPONSE_MS: 600,
  MAX_RESPONSE_MS: 18_000,
  IDEAL_RESPONSE_MIN_MS: 1_500,
  IDEAL_RESPONSE_MAX_MS: 9_000,
} as const

const PASS_THRESHOLDS: Record<QuestDifficulty, number> = {
  EASY: 52,
  NORMAL: 62,
  HARD: 72,
  ELITE: 80,
  NIGHTMARE: 88,
}

export function speechPassThreshold(difficulty: QuestDifficulty): number {
  return PASS_THRESHOLDS[difficulty]
}
