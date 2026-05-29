import { describe, expect, it } from "vitest"
import {
  dailyMilestoneProgress,
  DAILY_MILESTONE_TARGET,
  countDailyCompletionsToday,
} from "@/systems/quests/dailyMilestoneSystem"
import type { QuestContract } from "@/contracts/quest-contract"
import { utcDateKey } from "@/systems/quests/dailyQuestSystem"

const playerId = "00000000-0000-4000-8000-000000000099"
const date = utcDateKey()

function dailyQuest(completed: boolean): QuestContract {
  return {
    id: `daily-${playerId}-${date}-1`,
    title: "Daily",
    narrativeTier: "DAILY",
    type: "VOCABULARY",
    difficulty: "EASY",
    objectives: [{ id: "o1", description: "x", completed, currentProgress: completed ? 1 : 0, targetProgress: 1 }],
    rewards: { xp: 10, credits: 5 },
    penalties: { corruption: 0, fatigue: 0, xpDebt: 0 },
  } as unknown as QuestContract
}

describe("dailyMilestoneSystem", () => {
  it("counts completed dailies for today", () => {
    const quests = [dailyQuest(true), dailyQuest(false)]
    expect(countDailyCompletionsToday(quests, playerId, date)).toBe(1)
  })

  it("marks bonus ready at third clear", () => {
    const quests = [
      dailyQuest(true),
      { ...dailyQuest(true), id: `daily-${playerId}-${date}-2` },
      { ...dailyQuest(true), id: `daily-${playerId}-${date}-3` },
    ]
    const progress = dailyMilestoneProgress(quests, playerId)
    expect(progress.completed).toBe(3)
    expect(progress.target).toBe(DAILY_MILESTONE_TARGET)
    expect(progress.bonusReady).toBe(true)
  })
})
