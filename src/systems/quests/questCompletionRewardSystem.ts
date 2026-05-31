import type { QuestContract } from "@/contracts/quest-contract"
import {
  peakEncounterStreak,
  xpMultiplierFromStreak,
} from "@/systems/learning/encounterPressureSystem"
import { getMasterySnapshot } from "@/systems/mastery/masterySystem"
import { buildWordEntityMetadata } from "@/systems/vocabulary/entityHuntSystem"
import { aggregatePassiveBonuses } from "@/systems/vocabulary/wordPassiveSystem"

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

/** Apply stacked word entity passive XP resonance before server completion. */
export function applyWordPassiveToQuestRewards(
  quest: QuestContract
): QuestContract {
  if (quest.rewards.xp <= 0) return quest

  const snapshot = getMasterySnapshot()
  if (!snapshot.length) return quest

  const bonuses = aggregatePassiveBonuses(
    snapshot.map((row) => ({
      mastery: row.mastery,
      meta: buildWordEntityMetadata(row.wordId, row),
    }))
  )

  const xpBonus = bonuses
    .filter((b) => b.id.includes("xp"))
    .reduce((sum, b) => sum + b.magnitude, 0)

  if (xpBonus <= 0) return quest

  const mult = 1 + xpBonus / 100
  return {
    ...quest,
    rewards: {
      ...quest.rewards,
      xp: Math.floor(quest.rewards.xp * mult),
    },
  }
}

export function applyQuestRewardModifiers(quest: QuestContract): QuestContract {
  return applyWordPassiveToQuestRewards(applyEncounterStreakToQuestRewards(quest))
}
