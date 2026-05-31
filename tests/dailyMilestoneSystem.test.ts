import { describe, expect, it } from "vitest"
import {
  DAILY_MILESTONE_TARGET,
  dailyMilestoneProgress,
} from "@/systems/quests/dailyMilestoneSystem"
import type { QuestContract } from "@/contracts/quest-contract"

describe("dailyMilestoneSystem", () => {
  it("uses single daily anomaly target", () => {
    expect(DAILY_MILESTONE_TARGET).toBe(1)
  })

  it("marks bonus ready after one daily clear", () => {
    const playerId = "player-1"
    const date = new Date().toISOString().slice(0, 10)
    const quest: QuestContract = {
      id: `daily-${playerId}-${date}-0`,
      type: "VOCABULARY",
      title: "Daily",
      description: "Daily",
      difficulty: "EASY",
      narrativeTier: "DAILY",
      rewards: { xp: 10 },
      objectives: [{ id: "o", description: "x", completed: true, currentProgress: 1, requiredProgress: 1 }],
    }
    const progress = dailyMilestoneProgress([quest], playerId)
    expect(progress.completed).toBe(1)
    expect(progress.bonusReady).toBe(true)
  })
})
