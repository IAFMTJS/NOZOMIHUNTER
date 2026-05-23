import { describe, expect, it } from "vitest"
import { canCompleteQuest } from "@/systems/quests/questValidator"
import type { QuestContract } from "@/contracts/quest-contract"

function baseQuest(overrides: Partial<QuestContract> = {}): QuestContract {
  return {
    id: "q1",
    type: "VOCABULARY",
    title: "Test",
    description: "Test",
    difficulty: "EASY",
    objectives: [
      {
        id: "o1",
        description: "Complete",
        requiredProgress: 3,
        currentProgress: 0,
        completed: false,
      },
    ],
    rewards: { xp: 10 },
    isTutorial: false,
    ...overrides,
  }
}

describe("canCompleteQuest", () => {
  it("returns false when progress below required", () => {
    expect(canCompleteQuest(baseQuest())).toBe(false)
  })

  it("returns true when objective meets required progress", () => {
    const quest = baseQuest({
      objectives: [
        {
          id: "o1",
          description: "Complete",
          requiredProgress: 3,
          currentProgress: 3,
          completed: false,
        },
      ],
    })
    expect(canCompleteQuest(quest)).toBe(true)
  })
})
