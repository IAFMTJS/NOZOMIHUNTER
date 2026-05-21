import { eventBus } from "@/systems/events/eventBus"
import { GAME_EVENTS } from "@/systems/events/eventTypes"
import type { PlayerPenaltyContract } from "@/contracts/player-contract"
import type { QuestPenaltyContract } from "@/contracts/quest-contract"
import { PENALTY_CONFIG } from "@/config/penaltyConfig"

export function mergePenalties(
  current: PlayerPenaltyContract,
  delta?: QuestPenaltyContract
): PlayerPenaltyContract {
  if (!delta) return current

  return {
    corruption: current.corruption + (delta.corruption ?? 0),
    fatigue: current.fatigue + (delta.fatigue ?? 0),
    xpDebt: current.xpDebt + (delta.xpDebt ?? 0),
  }
}

export function applyQuestFailurePenalties(
  current: PlayerPenaltyContract,
  questPenalties?: QuestPenaltyContract,
  isTutorial = false
): PlayerPenaltyContract {
  const delta =
    questPenalties ??
    (isTutorial
      ? PENALTY_CONFIG.TUTORIAL_QUEST_FAILURE
      : PENALTY_CONFIG.DEFAULT_QUEST_FAILURE)

  const next = mergePenalties(current, delta)

  eventBus.emit(GAME_EVENTS.PENALTY_TRIGGERED, {
    corruption: next.corruption,
    fatigue: next.fatigue,
    xpDebt: next.xpDebt,
    delta,
  })

  return next
}

export function fatigueXpMultiplier(fatigue: number): number {
  const reduction = fatigue * PENALTY_CONFIG.FATIGUE_XP_REDUCTION_PER_POINT
  return Math.max(
    PENALTY_CONFIG.MIN_XP_MULTIPLIER_FROM_FATIGUE,
    1 - reduction
  )
}
