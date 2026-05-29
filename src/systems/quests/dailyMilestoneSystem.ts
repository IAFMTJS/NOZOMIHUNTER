import type { QuestContract } from "@/contracts/quest-contract"
import { utcDateKey } from "@/systems/quests/dailyQuestSystem"

export const DAILY_MILESTONE_TARGET = 3

export const DAILY_MILESTONE_BONUS_CREDITS = 25

export function countDailyCompletionsToday(
  quests: QuestContract[],
  playerId: string,
  date: string = utcDateKey()
): number {
  const prefix = `daily-${playerId}-${date}`
  return quests.filter(
    (q) =>
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
