import type { HunterRank, PlayerPenaltyContract } from "@/contracts/player-contract"
import type { PlayerProgressionContract } from "@/contracts/player-contract"

/** Client progression snapshot used by the player store and lifecycles. */
export interface ProgressionState {
  xp: number
  level: number
  rank: HunterRank
  penalties: PlayerPenaltyContract
  progression: PlayerProgressionContract
}

export interface ProgressionUpdateResult extends ProgressionState {
  xpGained: number
  leveledUp: boolean
  rankUp: boolean
}
