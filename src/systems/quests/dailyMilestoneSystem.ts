import type { QuestContract } from "@/contracts/quest-contract"
import { utcDateKey } from "@/systems/quests/dailyQuestSystem"
import { isTrainingQuest } from "@/systems/training/trainingMissionSystem"

export const DAILY_MILESTONE_TARGET = 1

export const DAILY_MILESTONE_BONUS_CREDITS = 25

export function countDailyCompletionsToday(
  quests: QuestContract[],
  playerId: string,
  date: string = utcDateKey()
): number {
  const prefix = `daily-${playerId}-${date}`
  return quests.filter(
    (q) =>
      !isTrainingQuest(q) &&
      q.narrativeTier === "DAILY" &&
      q.id.startsWith(prefix) &&
      q.objectives.length > 0 &&
      q.objectives.every((o) => o.completed)
  ).length
}

export function dailyMilestoneProgress(
  quests: QuestContract[],
  playerId: string
): { completed: number; target: number; bonusReady: boolean } {
  const completed = countDailyCompletionsToday(quests, playerId)
  return {
    completed,
    target: DAILY_MILESTONE_TARGET,
    bonusReady: completed >= DAILY_MILESTONE_TARGET,
  }
}

export function dailyChainRemainingLabel(completed: number): string {
  const remaining = Math.max(0, DAILY_MILESTONE_TARGET - completed)
  if (remaining === 0) {
    return `${DAILY_MILESTONE_TARGET}/${DAILY_MILESTONE_TARGET} clear — daily anomaly bonus ready.`
  }
  return `${completed}/${DAILY_MILESTONE_TARGET} clears — complete today's anomaly for bonus credits.`
}

export function dailyChainStepReward(step: number): number {
  if (step >= DAILY_MILESTONE_TARGET) return DAILY_MILESTONE_BONUS_CREDITS
  return step === 2 ? Math.floor(DAILY_MILESTONE_BONUS_CREDITS / 2) : 0
}
