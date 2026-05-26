import { describe, expect, it, beforeEach } from "vitest"
import type { QuestContract } from "@/contracts/quest-contract"
import { resetMasteryState, setMasteryPercent } from "@/systems/mastery/masterySystem"
import { refreshVocabularyPreparationForActiveQuests } from "@/systems/vocabulary/vocabularyPreparationOrchestrator"
import { mockPlayerContract } from "./helpers/mockPlayerContract"

function vocabQuest(wordId: string): QuestContract {
  return {
    id: "vocab-q",
    type: "VOCABULARY",
    title: "Vocab drill",
    description: "Test",
    difficulty: "EASY",
    objectives: [],
    rewards: { xp: 10 },
    isTutorial: false,
    vocabularyEncounter: {
      words: [
        {
          id: wordId,
          japanese: "テスト",
          reading: "てすと",
          romaji: "tesuto",
          meanings: ["test"],
        },
      ],
      currentIndex: 0,
      wrongAttempts: 0,
      correctStreak: 0,
    },
  }
}

describe("refreshVocabularyPreparationForActiveQuests", () => {
  beforeEach(() => {
    resetMasteryState()
  })

  it("clears unknown vocabulary highlights after mastery is updated", () => {
    const wordId = "jmdict:1000000"
    const player = mockPlayerContract({
      stats: {
        vocabulary: 0,
        grammar: 0,
        listening: 0,
        speaking: 0,
        confidence: 0,
        intelligence: 0,
        consistency: 0,
      },
    })

    const [before] = refreshVocabularyPreparationForActiveQuests([vocabQuest(wordId)], {
      player,
    })
    expect(before.vocabularyPreparation?.newVocabulary.length).toBeGreaterThan(0)
    const scoreBefore = before.vocabularyPreparation?.preparationScore ?? 0

    setMasteryPercent(wordId, 80)
    const [after] = refreshVocabularyPreparationForActiveQuests([vocabQuest(wordId)], {
      player,
    })
    expect(after.vocabularyPreparation?.newVocabulary.length).toBe(0)
    const scoreAfter = after.vocabularyPreparation?.preparationScore ?? 0

    expect(scoreAfter).toBeGreaterThan(scoreBefore)
    expect(scoreAfter).toBeGreaterThanOrEqual(60)
  })
})
