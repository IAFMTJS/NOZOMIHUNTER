import { eventBus } from "@/systems/events/eventBus"
import { GAME_EVENTS } from "@/systems/events/eventTypes"
import type { HunterRank, PlayerPenaltyContract } from "@/contracts/player-contract"
import type { QuestRewardContract } from "@/contracts/quest-contract"
import { applyXpGain } from "./xpSystem"
import { calculateQuestReward } from "./rewardSystem"
import { mergeUnlocks, defaultProgression } from "./unlockSystem"
import type { PlayerProgressionContract } from "@/contracts/player-contract"
import { canGrantXp } from "@/systems/antiExploit/xpGuard"

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

export function applyQuestReward(
  state: ProgressionState,
  rewards: QuestRewardContract,
  playerId: string
): ProgressionUpdateResult | null {
  const payload = calculateQuestReward(rewards)

  if (!canGrantXp(playerId, payload.xp)) {
    return null
  }

  const xpResult = applyXpGain(
    state.xp,
    payload.xp,
    state.penalties.xpDebt
  )

  const progression = mergeUnlocks(
    state.progression ?? defaultProgression(),
    payload.unlocks
  )

  eventBus.emit(GAME_EVENTS.XP_GAINED, {
    playerId,
    xpGained: xpResult.xpGained,
    totalXp: xpResult.xp,
  })

  if (xpResult.leveledUp) {
    eventBus.emit(GAME_EVENTS.LEVEL_UP, {
      playerId,
      level: xpResult.level,
      previousLevel: xpResult.previousLevel,
    })
  }

  if (xpResult.rankUp) {
    eventBus.emit(GAME_EVENTS.RANK_UP, {
      playerId,
      rank: xpResult.rank,
    })
  }

  return {
    xp: xpResult.xp,
    level: xpResult.level,
    rank: xpResult.rank,
    penalties: state.penalties,
    progression,
    xpGained: xpResult.xpGained,
    leveledUp: xpResult.leveledUp,
    rankUp: xpResult.rankUp,
  }
}
