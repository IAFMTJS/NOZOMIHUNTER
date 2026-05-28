import { describe, expect, it } from "vitest"
import { isRecallChallengeQuest } from "@/systems/learning/encounterDisplayPolicy"
import type { QuestContract } from "@/contracts/quest-contract"

function baseQuest(overrides: Partial<QuestContract> = {}): QuestContract {
  return {
    id: "q1",
    type: "VOCABULARY",
    title: "Test",
    description: "Test",
    difficulty: "NORMAL",
    objectives: [],
    rewards: { xp: 10 },
    isTutorial: false,
    ...overrides,
  }
}

describe("isRecallChallengeQuest", () => {
  it("true for vocabulary quests", () => {
    expect(isRecallChallengeQuest(baseQuest())).toBe(true)
  })

  it("false for conversation-only quests", () => {
    expect(
      isRecallChallengeQuest(
        baseQuest({
          type: "CONVERSATION",
          vocabularyEncounter: undefined,
          conversationEncounter: {
            scenarioId: "s1",
            directorName: "Director",
            briefing: "Brief",
            requiredExchanges: 3,
            messages: [],
            successfulExchanges: 0,
            wrongTurns: 0,
          },
        })
      )
    ).toBe(false)
  })

  it("true for hidden training quests", () => {
    expect(isRecallChallengeQuest(baseQuest({ hidden: true, type: "VOCABULARY" }))).toBe(
      true
    )
  })
})
