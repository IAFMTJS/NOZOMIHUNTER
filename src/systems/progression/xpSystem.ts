import { PROGRESSION_CONFIG } from "@/config/progressionConfig"
import { levelFromXp, xpProgressInCurrentLevel } from "./levelSystem"
import { didRankIncrease, rankFromLevel } from "./rankSystem"
import type { HunterRank } from "@/contracts/player-contract"

export interface XpApplicationResult {
  xp: number
  level: number
  rank: HunterRank
  xpGained: number
  leveledUp: boolean
  rankUp: boolean
  previousLevel: number
  progress: { current: number; required: number }
}

export function applyXpGain(
  currentXp: number,
  amount: number,
  xpDebt = 0
): XpApplicationResult {
  const previousLevel = levelFromXp(currentXp)
  const effectiveGain = Math.max(0, amount - Math.min(xpDebt, amount))
  const newXp = currentXp + effectiveGain
  const level = levelFromXp(newXp)
  const rank = rankFromLevel(level)
  const rankChange = didRankIncrease(previousLevel, level)

  return {
    xp: newXp,
    level,
    rank,
    xpGained: effectiveGain,
    leveledUp: level > previousLevel,
    rankUp: rankChange.increased,
    previousLevel,
    progress: xpProgressInCurrentLevel(newXp, level),
  }
}

export function clampXpReward(amount: number): number {
  return Math.min(amount, PROGRESSION_CONFIG.MAX_XP_PER_WINDOW)
}
