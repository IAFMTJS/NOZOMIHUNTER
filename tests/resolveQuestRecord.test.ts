import { describe, expect, it } from "vitest"
import { resolveQuestRecord } from "@/systems/quests/resolveQuestRecord"
import type { QuestContract } from "@/contracts/quest-contract"

function quest(id: string): QuestContract {
  return {
    id,
    type: "VOCABULARY",
    title: id,
    description: "test",
    difficulty: "EASY",
    objectives: [],
    rewards: { xp: 10 },
    isTutorial: false,
  }
}

describe("resolveQuestRecord", () => {
  it("resolves from regular, active, then completed snapshots", () => {
    const regular = [quest("regular")]
    const active = [quest("active")]
    const completed = [quest("completed")]

    expect(
      resolveQuestRecord({
        questId: "active",
        regularQuests: regular,
        activeQuests: active,
        completedQuests: completed,
      })?.id
    ).toBe("active")

    expect(
      resolveQuestRecord({
        questId: "completed",
        regularQuests: regular,
        activeQuests: active,
        completedQuests: completed,
      })?.id
    ).toBe("completed")
  })
})
