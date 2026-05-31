import type { WordEntityMetadata } from "@/contracts/vocabulary-contract"
import { classifyEntityState } from "./entityHuntSystem"

/** Maximum total passive XP bonus percent from mastered words. */
export const MAX_PASSIVE_XP_BONUS_PERCENT = 35

export interface WordPassiveBonus {
  id: string
  label: string
  /** Percent bonus (e.g. 5 = +5% XP from vocab encounters) */
  magnitude: number
}

export function getWordPassiveBonuses(
  mastery: number,
  meta?: Pick<WordEntityMetadata, "captureState" | "dangerClassification">
): WordPassiveBonus[] {
  const state = meta?.captureState ?? classifyEntityState(mastery)
  if (state === "UNKNOWN") return []

  const bonuses: WordPassiveBonus[] = []

  if (state === "STABILIZED") {
    bonuses.push({
      id: "stabilized-xp",
      label: "Stabilized resonance",
      magnitude: 3,
    })
  }

  if (state === "MASTERED") {
    bonuses.push(
      {
        id: "mastered-xp",
        label: "Mastered resonance",
        magnitude: 8,
      },
      {
        id: "mastered-corruption",
        label: "Corruption dampening",
        magnitude: 2,
      }
    )
    if (meta?.dangerClassification === "SECTOR_CRITICAL") {
      bonuses.push({
        id: "critical-readiness",
        label: "Sector readiness",
        magnitude: 5,
      })
    }
  }

  return bonuses
}

export function aggregatePassiveBonuses(
  entries: { mastery: number; meta?: WordEntityMetadata }[]
): WordPassiveBonus[] {
  const byId = new Map<string, WordPassiveBonus>()

  for (const entry of entries) {
    for (const bonus of getWordPassiveBonuses(entry.mastery, entry.meta)) {
      const existing = byId.get(bonus.id)
      if (!existing) {
        byId.set(bonus.id, { ...bonus })
      } else {
        byId.set(bonus.id, {
          ...existing,
          magnitude: existing.magnitude + bonus.magnitude,
        })
      }
    }
  }

  return [...byId.values()]
}

/** Sum XP-related passive magnitudes with a hard cap. */
export function cappedPassiveXpBonusPercent(bonuses: WordPassiveBonus[]): number {
  const raw = bonuses
    .filter((b) => b.id.includes("xp"))
    .reduce((sum, b) => sum + b.magnitude, 0)
  return Math.min(raw, MAX_PASSIVE_XP_BONUS_PERCENT)
}

export function passiveBonusSummary(bonuses: WordPassiveBonus[]): string {
  if (!bonuses.length) return "No passive resonance."
  return bonuses.map((b) => `${b.label} +${b.magnitude}%`).join(" · ")
}
