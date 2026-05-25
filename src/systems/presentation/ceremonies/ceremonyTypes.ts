import type { QuestNarrativeTier } from "@/contracts/quest-contract"
import type { RewardIconItem } from "@/components/ui/screen/RewardIconGrid"

export interface GateClearedStats {
  timeLabel: string
  accuracyPercent: number
  grade: string
  newWordsUnlocked?: number
  masteryIncreasePercent?: number
}

export type CompletionCeremonyTier = "light" | "medium" | "full" | "dungeon"

export type RewardRevealMode = "instant" | "sequential"

export interface StatGainLine {
  label: string
  delta: number
}

export interface LevelUpCeremonyViewModel {
  previousLevel: number
  level: number
  title: string
  statGains: StatGainLine[]
  unlockLabels: string[]
}

export interface DungeonClearCeremonyViewModel {
  dungeonName: string
  grade: string
  performanceLabel: string
  rewards: RewardIconItem[]
  xpGained: number
  streakMultiplier?: number
  masteryRecap?: { label: string; mastery: number }[]
  aftermathLines: string[]
}

export interface CompletionCeremonyContext {
  tier: CompletionCeremonyTier
  revealMode: RewardRevealMode
  sourceTitle?: string
  narrativeTier?: QuestNarrativeTier
}

export function ceremonyTierFromNarrative(
  tier?: QuestNarrativeTier,
  isDungeon?: boolean
): CompletionCeremonyTier {
  if (isDungeon) return "dungeon"
  if (tier === "DAILY") return "light"
  if (tier === "SIDE") return "medium"
  return "full"
}

export function revealModeForTier(tier: CompletionCeremonyTier): RewardRevealMode {
  if (tier === "light") return "instant"
  return "sequential"
}
