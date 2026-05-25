import { createVocabularyEncounter } from "@/systems/quests/vocabularyEncounterSystem"

/** Decay window per prompt (ms) — UI maps to visual fade. */
export const SHADOW_TYPING_DECAY_MS = 8000

/** Fast-decay typing drill — short word list. */
export function createShadowTypingEncounter() {
  return createVocabularyEncounter(4)
}

export function shadowDecayPercent(elapsedMs: number): number {
  return Math.max(0, 100 - (elapsedMs / SHADOW_TYPING_DECAY_MS) * 100)
}

export function isShadowPromptExpired(elapsedMs: number): boolean {
  return elapsedMs >= SHADOW_TYPING_DECAY_MS
}
