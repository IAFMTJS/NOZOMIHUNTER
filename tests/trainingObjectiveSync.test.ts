import { describe, expect, it } from "vitest"
import { buildTrainingQuest } from "@/systems/training/trainingMissionSystem"
import { canCompleteQuest } from "@/systems/quests/questValidator"

describe("syncTrainingObjectivesFromEncounter", () => {
  it("sets requiredProgress to kana dash word count", () => {
    const quest = buildTrainingQuest("KANA_DASH", 5)
    expect(quest.objectives[0]?.requiredProgress).toBe(
      quest.vocabularyEncounter!.words.length
    )
    expect(quest.objectives[0]?.requiredProgress).toBeGreaterThan(1)
  })

  it("blocks claim after one vocab answer", () => {
    const quest = buildTrainingQuest("KANA_DASH", 5)
    const partial = {
      ...quest,
      objectives: quest.objectives.map((o) => ({
        ...o,
        currentProgress: 1,
      })),
      vocabularyEncounter: {
        ...quest.vocabularyEncounter!,
        currentIndex: 1,
      },
    }
    expect(canCompleteQuest(partial)).toBe(false)
  })

  it("allows claim when encounter complete", () => {
    const quest = buildTrainingQuest("KANA_DASH", 5)
    const wordCount = quest.vocabularyEncounter!.words.length
    const complete = {
      ...quest,
      objectives: quest.objectives.map((o) => ({
        ...o,
        currentProgress: wordCount,
        completed: true,
      })),
      vocabularyEncounter: {
        ...quest.vocabularyEncounter!,
        currentIndex: wordCount,
      },
    }
    expect(canCompleteQuest(complete)).toBe(true)
  })

  it("uses narrativeTier SIDE not DAILY", () => {
    const quest = buildTrainingQuest("SIGNAL_CALIBRATION", 3)
    expect(quest.narrativeTier).toBe("SIDE")
  })

  it("syncs listening fragment count", () => {
    const base = buildTrainingQuest("SIGNAL_CALIBRATION", 1)
    expect(base.listeningEncounter?.fragments.length).toBeGreaterThan(0)
    expect(base.objectives[0]?.requiredProgress).toBe(
      base.listeningEncounter!.fragments.length
    )
  })
})
