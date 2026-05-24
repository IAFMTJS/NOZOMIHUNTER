import type { QuestContract } from "@/contracts/quest-contract"
import { createQuestInstanceId } from "@/systems/quests/questIds"
import { createVocabularyEncounter } from "@/systems/quests/vocabularyEncounterSystem"
import { createListeningEncounter } from "@/systems/dungeons/listeningEncounterSystem"
import { PENALTY_CONFIG } from "@/config/penaltyConfig"
import { LISTENING_QUEST_CONFIG } from "@/config/listeningQuestConfig"

export type TrainingMissionKind = "vocabulary" | "listening"

export function buildTrainingQuest(
  kind: TrainingMissionKind,
  playerLevel: number
): QuestContract {
  const id = `training-${kind}-${createQuestInstanceId()}`
  const difficulty = "EASY"
  const rewards = { xp: 15 + Math.min(playerLevel * 3, 30) }

  if (kind === "listening") {
    const fragmentCount = 2
    const encounter = createListeningEncounter(
      fragmentCount,
      "Training channel: decode calibration signals."
    )
    return {
      id,
      type: "LISTENING",
      title: "Signal Training",
      description: "Repeatable listening drill — no contract penalty.",
      difficulty,
      narrativeTier: "DAILY",
      rewards,
      penalties: PENALTY_CONFIG.TUTORIAL_QUEST_FAILURE,
      listeningEncounter: encounter,
      objectives: [
        {
          id: "obj-1",
          description: "Complete training fragments",
          currentProgress: 0,
          requiredProgress: fragmentCount,
          completed: false,
        },
      ],
      hidden: true,
    }
  }

  const encounter = createVocabularyEncounter(3)
  return {
    id,
    type: "VOCABULARY",
    title: "Stabilization Training",
    description: "Repeatable vocabulary drill for steady progression.",
    difficulty,
    narrativeTier: "DAILY",
    rewards,
    penalties: PENALTY_CONFIG.TUTORIAL_QUEST_FAILURE,
    vocabularyEncounter: encounter,
    objectives: [
      {
        id: "obj-1",
        description: "Complete training targets",
        currentProgress: 0,
        requiredProgress: encounter.words.length,
        completed: false,
      },
    ],
    hidden: true,
  }
}

export function isTrainingQuest(quest: QuestContract): boolean {
  return quest.id.startsWith("training-")
}
