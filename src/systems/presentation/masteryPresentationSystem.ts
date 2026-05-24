import type { WordMastery } from "@/systems/vocabulary/vocabularyMasterySystem"

/** Learner-facing labels aligned with update2 vocabulary feedback. */
export function masteryTierLearnerLabel(tier: WordMastery): string {
  switch (tier) {
    case "MASTERED":
      return "Mastered"
    case "CONFIDENT":
      return "Stable"
    case "UNDERSTOOD":
      return "Familiar"
    case "RECOGNIZED":
      return "Seen"
    case "SEEN":
      return "Seen"
    default:
      return "Unknown"
  }
}

export function masteryCardClass(masteryPercent: number): string {
  const tier = masteryPercent >= 80 ? "mastered" : masteryPercent >= 40 ? "stable" : masteryPercent > 0 ? "familiar" : "unknown"
  return `nozomi-word-card--${tier}`
}
