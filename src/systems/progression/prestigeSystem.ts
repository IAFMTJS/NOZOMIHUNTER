import type { PlayerContract } from "@/contracts/player-contract"
import { PROGRESSION_CONFIG } from "@/config/progressionConfig"

export interface PrestigeEligibility {
  eligible: boolean
  reason: string
  prestigeCount: number
}

export function checkPrestigeEligibility(player: PlayerContract): PrestigeEligibility {
  const prestigeCount = player.progression.prestigeCount ?? 0
  if (player.rank !== "SSS") {
    return {
      eligible: false,
      reason: "Reach rank SSS to unlock prestige.",
      prestigeCount,
    }
  }
  if (player.level < PROGRESSION_CONFIG.RANK_THRESHOLDS.SSS) {
    return {
      eligible: false,
      reason: `Reach level ${PROGRESSION_CONFIG.RANK_THRESHOLDS.SSS} to prestige.`,
      prestigeCount,
    }
  }
  return {
    eligible: true,
    reason: "Reset rank loop — retain prestige frame and +10 discipline.",
    prestigeCount,
  }
}

export function applyPrestigeResetLocal(player: PlayerContract): PlayerContract {
  return {
    ...player,
    level: 1,
    xp: 0,
    rank: "E",
    progression: {
      ...player.progression,
      prestigeCount: (player.progression.prestigeCount ?? 0) + 1,
      discipline: player.progression.discipline + 10,
      titles: [...player.progression.titles, `Prestige ${(player.progression.prestigeCount ?? 0) + 1}`],
    },
  }
}
