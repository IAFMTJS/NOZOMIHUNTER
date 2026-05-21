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

export interface QuestCompleteResult {
  quest: QuestContract
  progression: ProgressionUpdateResult | null
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

  const progression = applyQuestReward(
    progressionState,
    quest.rewards,
    playerId
  )

  return { quest: completedQuest, progression }
}
