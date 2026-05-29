import { PROGRESSION_CONFIG } from "@/config/progressionConfig"
import type { HunterRank } from "@/contracts/player-contract"

const RANK_ORDER: HunterRank[] = ["E", "D", "C", "B", "A", "S", "SS", "SSS"]

export function rankFromLevel(level: number): HunterRank {
  let current: HunterRank = "E"

  for (const rank of RANK_ORDER) {
    const threshold =
      PROGRESSION_CONFIG.RANK_THRESHOLDS[
        rank as keyof typeof PROGRESSION_CONFIG.RANK_THRESHOLDS
      ]
    if (level >= threshold) current = rank
  }

  return current
}

export function didRankIncrease(
  previousLevel: number,
  newLevel: number
): { increased: boolean; newRank?: HunterRank } {
  const prev = rankFromLevel(previousLevel)
  const next = rankFromLevel(newLevel)
  if (next !== prev && newLevel > previousLevel) {
    return { increased: true, newRank: next }
  }
  return { increased: false }
}
