import type { HunterRank } from "@/contracts/player-contract"

const RANK_ORDER: HunterRank[] = ["E", "D", "C", "B", "A", "S"]

const RANK_TITLES: Record<HunterRank, string> = {
  E: "Initiate Hunter",
  D: "Novice Hunter",
  C: "Regular Hunter",
  B: "Advanced Hunter",
  A: "Elite Hunter",
  S: "Shadow Hunter",
}

export function rankDisplayTitle(rank: HunterRank): string {
  return RANK_TITLES[rank]
}

export function previousRank(rank: HunterRank): HunterRank {
  const index = RANK_ORDER.indexOf(rank)
  return index > 0 ? RANK_ORDER[index - 1]! : "E"
}

export function rankPromotionRewards(rank: HunterRank): {
  xp: number
  skillPoints: number
  staminaBonus: number
} {
  const tier = RANK_ORDER.indexOf(rank)
  return {
    xp: 100 + tier * 50,
    skillPoints: 1 + Math.floor(tier / 2),
    staminaBonus: tier >= 2 ? 10 : 5,
  }
}
