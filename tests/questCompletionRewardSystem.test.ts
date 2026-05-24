import { describe, expect, it } from "vitest"
import { applyEncounterStreakToQuestRewards } from "@/systems/quests/questCompletionRewardSystem"
import type { QuestContract } from "@/contracts/quest-contract"

const baseQuest = {
  id: "q1",
  rewards: { xp: 100 },
  vocabularyEncounter: { correctStreak: 4 },
} as unknown as QuestContract

describe("questCompletionRewardSystem", () => {
  it("applies 1.1x XP at streak 3+", () => {
    const boosted = applyEncounterStreakToQuestRewards(baseQuest)
    expect(boosted.rewards.xp).toBe(110)
  })

  it("leaves XP unchanged without streak", () => {
    const quest = {
      ...baseQuest,
      vocabularyEncounter: { correctStreak: 0 },
    } as unknown as QuestContract
    expect(applyEncounterStreakToQuestRewards(quest).rewards.xp).toBe(100)
  })
})
