import type { HunterRank } from "@/contracts/player-contract"

export function rankFromLevel(level: number): HunterRank {
  if (level >= 75) return "S"
  if (level >= 50) return "A"
  if (level >= 35) return "B"
  if (level >= 20) return "C"
  if (level >= 10) return "D"
  return "E"
}
