import type { WordMasteryContract } from "@/contracts/vocabulary-contract"
import { BREW_CONFIG } from "@/config/brewConfig"

const DECAY_DAYS_THRESHOLD = 7
const MS_PER_DAY = 86_400_000

export function computeWordInstability(
  mastery: WordMasteryContract | undefined,
  now: Date = new Date()
): number {
  if (!mastery || mastery.mastery <= 0) return 0
  if (mastery.mastery >= BREW_CONFIG.LEARNED_MASTERY_THRESHOLD) return 0

  const lastSeen = mastery.lastSeenAt
    ? new Date(mastery.lastSeenAt).getTime()
    : now.getTime()
  const daysSince = Math.max(0, (now.getTime() - lastSeen) / MS_PER_DAY)
  const decayBase = Math.min(100, Math.round((daysSince / DECAY_DAYS_THRESHOLD) * 60))
  const masteryDamp = Math.round(mastery.mastery * 0.3)
  return Math.min(100, Math.max(0, decayBase - masteryDamp))
}

export function hasMemoryDecay(instability: number): boolean {
  return instability >= 40
}

export function instabilityLabel(instability: number): string {
  if (instability >= 70) return `WORD INSTABILITY: ${instability}%`
  if (instability >= 40) return "MEMORY DECAY DETECTED"
  return ""
}
