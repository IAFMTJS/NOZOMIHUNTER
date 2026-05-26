import { eventBus } from "@/systems/events/eventBus"
import { GAME_EVENTS } from "@/systems/events/eventTypes"
import type { QuestContract } from "@/contracts/quest-contract"
import { advanceObjective } from "./questValidator"
import { applyQuestFailurePenalties } from "@/systems/penalties/penaltySystem"
import type { PlayerPenaltyContract } from "@/contracts/player-contract"
import { attachVocabularyPreparation } from "@/systems/vocabulary/vocabularyPreparationOrchestrator"
import { isTrainingQuest } from "@/systems/training/trainingMissionSystem"

/** Quest accept / progress / fail only. Completion: questLifecycle + completeQuestGuarded. */

export interface QuestFailResult {
  quest: QuestContract
  penalties: PlayerPenaltyContract
}

export function acceptQuest(quest: QuestContract, playerId: string): QuestContract {
  const prepared = quest.vocabularyPreparation || isTrainingQuest(quest)
    ? quest
    : attachVocabularyPreparation(quest, { playerId })
  eventBus.emit(GAME_EVENTS.QUEST_ACCEPTED, { playerId, questId: quest.id })
  return prepared
}

export function progressQuestObjective(
  quest: QuestContract,
  objectiveId: string
): QuestContract {
  return {
    ...quest,
    objectives: advanceObjective(quest.objectives, objectiveId),
  }
}

export function failQuest(
  quest: QuestContract,
  penalties: PlayerPenaltyContract,
  playerId: string,
  options?: { suppressXpDebt?: boolean }
): QuestFailResult {
  eventBus.emit(GAME_EVENTS.QUEST_FAILED, {
    playerId,
    questId: quest.id,
    questType: quest.type,
  })

  let questPenalties = quest.penalties
  if (options?.suppressXpDebt && questPenalties?.xpDebt) {
    questPenalties = { ...questPenalties, xpDebt: 0 }
  }

  const nextPenalties = applyQuestFailurePenalties(
    penalties,
    questPenalties,
    quest.isTutorial
  )

  return { quest, penalties: nextPenalties }
}
