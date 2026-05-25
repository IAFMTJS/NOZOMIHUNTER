import type { WordMastery } from "@/systems/vocabulary/vocabularyMasterySystem"
import { numericMasteryToTier } from "@/systems/vocabulary/vocabularyMasteryBridge"

/** Canonical UI tiers (single source for cards + badges). */
export type CanonicalMasteryTier =
  | "UNKNOWN"
  | "SEEN"
  | "FAMILIAR"
  | "STABLE"
  | "MASTERED"

export function masteryTierFromPercent(masteryPercent: number): CanonicalMasteryTier {
  const legacy = numericMasteryToTier(masteryPercent)
  switch (legacy) {
    case "MASTERED":
      return "MASTERED"
    case "CONFIDENT":
      return "STABLE"
    case "UNDERSTOOD":
      return "FAMILIAR"
    case "RECOGNIZED":
    case "SEEN":
      return "SEEN"
    default:
      return "UNKNOWN"
  }
}

/** Learner-facing labels aligned with game-feel doc. */
export function masteryTierLearnerLabel(tier: CanonicalMasteryTier | WordMastery): string {
  const canonical =
    typeof tier === "string" && ["UNKNOWN", "SEEN", "FAMILIAR", "STABLE", "MASTERED"].includes(tier)
      ? (tier as CanonicalMasteryTier)
      : masteryTierFromPercent(
          tier === "MASTERED"
            ? 85
            : tier === "CONFIDENT"
              ? 65
              : tier === "UNDERSTOOD"
                ? 45
                : tier === "RECOGNIZED" || tier === "SEEN"
                  ? 15
                  : 0
        )
  switch (canonical) {
    case "MASTERED":
      return "Mastered"
    case "STABLE":
      return "Stable"
    case "FAMILIAR":
      return "Familiar"
    case "SEEN":
      return "Seen"
    default:
      return "Unknown"
  }
}

export function masteryBadgeClass(masteryPercent: number): string {
  const tier = masteryTierFromPercent(masteryPercent)
  return `nozomi-mastery-badge nozomi-mastery--${tier.toLowerCase()}`
}

export function masteryCardClass(masteryPercent: number): string {
  const tier = masteryTierFromPercent(masteryPercent)
  return `nozomi-word-card--${tier === "MASTERED" ? "mastered" : tier === "STABLE" ? "stable" : tier === "FAMILIAR" || tier === "SEEN" ? "familiar" : "unknown"}`
}

export function masteryRarityFrameClass(masteryPercent: number): string {
  if (masteryPercent >= 80) return "nozomi-word-rarity--mastered"
  if (masteryPercent >= 60) return "nozomi-word-rarity--stable"
  return ""
}
