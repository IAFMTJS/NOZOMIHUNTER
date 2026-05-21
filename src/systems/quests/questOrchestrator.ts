import { eventBus } from "@/systems/events/eventBus"
import { GAME_EVENTS } from "@/systems/events/eventTypes"
import type { QuestContract } from "@/contracts/quest-contract"
import {
  advanceObjective,
  canCompleteQuest,
  isQuestComplete,
} from "./questValidator"
import {
  applyQuestReward,
  type ProgressionState,
  type ProgressionUpdateResult,
} from "@/systems/progression/progressionOrchestrator"
import { applyQuestFailurePenalties } from "@/systems/penalties/penaltySystem"
import type { PlayerPenaltyContract } from "@/contracts/player-contract"
import { markTutorialComplete } from "@/systems/tutorial/tutorialSystem"

export interface QuestCompleteResult {
  quest: QuestContract
  progression: ProgressionUpdateResult | null
}

export interface QuestFailResult {
  quest: QuestContract
  penalties: PlayerPenaltyContract
}

export function acceptQuest(quest: QuestContract, playerId: string): QuestContract {
  eventBus.emit(GAME_EVENTS.QUEST_ACCEPTED, { playerId, questId: quest.id })
  return quest
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

export function completeQuest(
  quest: QuestContract,
  progressionState: ProgressionState,
  playerId: string
): QuestCompleteResult {
  if (!canCompleteQuest(quest) && !isQuestComplete(quest)) {
    throw new Error("Quest objectives not complete")
  }

  const completedQuest: QuestContract = {
    ...quest,
    objectives: quest.objectives.map((o) => ({
      ...o,
      completed: true,
      currentProgress: o.requiredProgress,
    })),
  }

  eventBus.emit(GAME_EVENTS.QUEST_COMPLETED, {
    playerId,
    questId: quest.id,
  })

  let progression = applyQuestReward(
    progressionState,
    quest.rewards,
    playerId
  )

  if (progression && quest.isTutorial) {
    progression = {
      ...progression,
      progression: markTutorialComplete(progression.progression),
    }
  }

  return { quest: completedQuest, progression }
}

export function failQuest(
  quest: QuestContract,
  penalties: PlayerPenaltyContract,
  playerId: string
): QuestFailResult {
  eventBus.emit(GAME_EVENTS.QUEST_FAILED, {
    playerId,
    questId: quest.id,
    questType: quest.type,
  })

  const nextPenalties = applyQuestFailurePenalties(
    penalties,
    quest.penalties,
    quest.isTutorial
  )

  return { quest, penalties: nextPenalties }
}
