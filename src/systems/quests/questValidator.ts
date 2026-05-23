import type {
  QuestContract,
  QuestObjectiveContract,
} from "@/contracts/quest-contract"

export function isQuestComplete(quest: QuestContract): boolean {
  return quest.objectives
    .filter((o) => !o.hidden)
    .every((o) => o.completed)
}

export function advanceObjective(
  objectives: QuestObjectiveContract[],
  objectiveId: string,
  increment = 1
): QuestObjectiveContract[] {
  return objectives.map((o) => {
    if (o.id !== objectiveId) return o
    const currentProgress = Math.min(
      o.requiredProgress,
      o.currentProgress + increment
    )
    return {
      ...o,
      currentProgress,
      completed: currentProgress >= o.requiredProgress,
    }
  })
}

export function canCompleteQuest(quest: QuestContract): boolean {
  return quest.objectives
    .filter((o) => !o.hidden)
    .every((o) => o.currentProgress >= o.requiredProgress)
}
