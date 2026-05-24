import type { QuestContract } from "@/contracts/quest-contract"
import {
  peakEncounterStreak,
  xpMultiplierFromStreak,
} from "@/systems/learning/encounterPressureSystem"

/** Bump quest snapshot rewards from in-run correct streak before server completion. */
export function applyEncounterStreakToQuestRewards(
  quest: QuestContract
): QuestContract {
  const streak = peakEncounterStreak(quest)
  const mult = xpMultiplierFromStreak(streak)
  if (mult <= 1 || quest.rewards.xp <= 0) return quest

  return {
    ...quest,
    rewards: {
      ...quest.rewards,
      xp: Math.floor(quest.rewards.xp * mult),
    },
  }
}
