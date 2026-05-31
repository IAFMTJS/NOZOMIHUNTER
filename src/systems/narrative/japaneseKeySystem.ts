import type { PlayerContract } from "@/contracts/player-contract"
import type { StoryProgressContract } from "@/contracts/narrative-contract"
import {
  masteryTierFromPercent,
  type CanonicalMasteryTier,
} from "@/systems/presentation/masteryPresentationSystem"
import { resolveStoryProgress } from "@/systems/narrative/storyProgressSystem"

const TIER_ORDER: CanonicalMasteryTier[] = [
  "UNKNOWN",
  "SEEN",
  "FAMILIAR",
  "STABLE",
  "MASTERED",
]

export interface JapaneseKeyGate {
  allowed: boolean
  playerTier: CanonicalMasteryTier
  requiredTier: CanonicalMasteryTier
  reason?: string
}

export function tierMeetsGate(
  current: CanonicalMasteryTier,
  required: CanonicalMasteryTier
): boolean {
  return TIER_ORDER.indexOf(current) >= TIER_ORDER.indexOf(required)
}

function playerMasteryTier(player: PlayerContract): CanonicalMasteryTier {
  const vocabStat = player.stats.vocabulary
  const mapped = Math.min(100, Math.max(0, vocabStat * 10))
  return masteryTierFromPercent(mapped)
}

/** Archive fragments and hidden nodes require minimum comprehension tier. */
export function canParseFragment(
  player: PlayerContract,
  japaneseExcerpt: string,
  minMasteryTier: CanonicalMasteryTier = "FAMILIAR"
): JapaneseKeyGate {
  const playerTier = playerMasteryTier(player)
  const trustBoost =
    (resolveStoryProgress(player).irisTrust ?? 0) >= 60 ? 1 : 0
  const effectiveIdx = TIER_ORDER.indexOf(playerTier) + trustBoost
  const requiredIdx = TIER_ORDER.indexOf(minMasteryTier)
  const allowed = effectiveIdx >= requiredIdx

  if (!allowed) {
    return {
      allowed: false,
      playerTier,
      requiredTier: minMasteryTier,
      reason: `Fragment requires ${minMasteryTier} comprehension — study ${japaneseExcerpt.slice(0, 8)}…`,
    }
  }
  return { allowed: true, playerTier, requiredTier: minMasteryTier }
}

export function canUnlockHiddenNode(
  player: PlayerContract,
  requiredGlyph: string,
  minMasteryTier: CanonicalMasteryTier = "STABLE"
): boolean {
  return canParseFragment(player, requiredGlyph, minMasteryTier).allowed
}

export function japaneseKeyBonusEligible(
  progress: StoryProgressContract,
  minTrust = 40
): boolean {
  return progress.irisTrust >= minTrust
}
