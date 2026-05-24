import type { QuestContract } from "@/contracts/quest-contract"
import { attachVocabularyPreparation } from "@/systems/vocabulary/vocabularyPreparationOrchestrator"
import { isQuestEncounterPlayable } from "@/systems/quests/questPlayabilitySystem"
import { logSystemEvent } from "@/systems/logger/logger"
import { rebuildQuestEncounter } from "./questEncounterRebuild"

export function repairQuestSnapshot(quest: QuestContract): QuestContract {
  const needsRepair =
    quest.type !== "DUNGEON" && !isQuestEncounterPlayable(quest)

  const repaired = rebuildQuestEncounter(quest)

  if (needsRepair) {
    logSystemEvent("quest", "quest_repair", {
      questId: quest.id,
      type: quest.type,
      reason: "encounter_rebuilt",
    })
  }

  if (repaired.vocabularyPreparation) {
    return repaired
  }

  return attachVocabularyPreparation(repaired)
}

export function mergeQuestRow(
  snapshot: QuestContract,
  progress: Record<string, unknown> | null
): QuestContract {
  let quest = snapshot

  if (progress?.vocabularyEncounter) {
    quest = {
      ...quest,
      vocabularyEncounter:
        progress.vocabularyEncounter as QuestContract["vocabularyEncounter"],
    }
  }

  if (progress?.conversationEncounter) {
    quest = {
      ...quest,
      conversationEncounter:
        progress.conversationEncounter as QuestContract["conversationEncounter"],
    }
  }

  if (progress?.speechEncounter) {
    quest = {
      ...quest,
      speechEncounter:
        progress.speechEncounter as QuestContract["speechEncounter"],
    }
  }

  if (progress?.listeningEncounter) {
    quest = {
      ...quest,
      listeningEncounter:
        progress.listeningEncounter as QuestContract["listeningEncounter"],
    }
  }

  if (progress?.dungeonRun) {
    quest = {
      ...quest,
      dungeonRun: progress.dungeonRun as QuestContract["dungeonRun"],
    }
  }

  if (Array.isArray(progress?.objectives)) {
    quest = {
      ...quest,
      objectives: progress.objectives as QuestContract["objectives"],
    }
  }

  return repairQuestSnapshot(quest)
}
