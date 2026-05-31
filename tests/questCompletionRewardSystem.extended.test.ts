import { describe, expect, it } from "vitest"
import { applyWordPassiveToQuestRewards } from "@/systems/quests/questCompletionRewardSystem"
import type { QuestContract } from "@/contracts/quest-contract"
import { hydrateMastery, resetMasteryState } from "@/systems/mastery/masterySystem"

describe("questCompletionRewardSystem extended", () => {
  it("scopes passive XP bonus to encounter word ids only", () => {
    resetMasteryState()
    hydrateMastery([
      {
        wordId: "in-run",
        mastery: 95,
        correctCount: 10,
        wrongCount: 0,
        lastSeenAt: new Date().toISOString(),
      },
      {
        wordId: "off-run",
        mastery: 95,
        correctCount: 10,
        wrongCount: 0,
        lastSeenAt: new Date().toISOString(),
      },
    ])
    const quest = {
      id: "q1",
      rewards: { xp: 100 },
      vocabularyEncounter: { words: [{ id: "in-run" }] },
    } as unknown as QuestContract

    const withOnlyInRun = applyWordPassiveToQuestRewards(quest)
    expect(withOnlyInRun.rewards.xp).toBeGreaterThanOrEqual(100)

    const emptyEncounter = applyWordPassiveToQuestRewards({
      ...quest,
      vocabularyEncounter: { words: [{ id: "missing" }] },
    } as unknown as QuestContract)
    expect(emptyEncounter.rewards.xp).toBe(100)
  })
})
