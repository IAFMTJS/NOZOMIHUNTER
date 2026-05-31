import { describe, expect, it } from "vitest"
import { failQuest } from "@/systems/quests/questOrchestrator"
import { canCompleteQuest } from "@/systems/quests/questValidator"
import type { QuestContract } from "@/contracts/quest-contract"
import { mockPlayerContract } from "./helpers/mockPlayerContract"

const incompleteTrainingQuest = {
  id: "training-kana_dash-abc",
  type: "VOCABULARY",
  title: "Drill",
  description: "Drill",
  difficulty: "EASY",
  narrativeTier: "SIDE",
  rewards: { xp: 20 },
  objectives: [
    {
      id: "obj-1",
      description: "Complete",
      currentProgress: 0,
      requiredProgress: 3,
      completed: false,
    },
  ],
  vocabularyEncounter: {
    words: [{ id: "w1" }, { id: "w2" }, { id: "w3" }],
    currentIndex: 0,
    wrongAttempts: 0,
    correctStreak: 0,
  },
} as unknown as QuestContract

describe("questLifecycle guards", () => {
  it("blocks completion when objectives lag encounter size", () => {
    expect(canCompleteQuest(incompleteTrainingQuest)).toBe(false)
  })

  it("failQuest applies quest penalties to player penalties", () => {
    const player = mockPlayerContract()
    const quest = {
      ...incompleteTrainingQuest,
      penalties: { corruption: 3, fatigue: 2, xpDebt: 10 },
    } as QuestContract
    const result = failQuest(quest, player.penalties, player.id)
    expect(result.penalties.corruption).toBeGreaterThan(player.penalties.corruption)
  })
})
