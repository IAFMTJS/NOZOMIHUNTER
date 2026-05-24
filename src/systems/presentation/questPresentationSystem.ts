import type { QuestContract } from "@/contracts/quest-contract"

export function aggregateQuestProgress(quest: QuestContract): {
  current: number
  required: number
  complete: boolean
} {
  const required = quest.objectives.reduce(
    (sum, objective) => sum + objective.requiredProgress,
    0
  )
  const current = quest.objectives.reduce(
    (sum, objective) =>
      sum + Math.min(objective.currentProgress, objective.requiredProgress),
    0
  )
  const complete =
    quest.objectives.length > 0 &&
    quest.objectives.every((objective) => objective.completed)

  return {
    current,
    required: required || 1,
    complete,
  }
}

export function estimatedDungeonSuccessRate(
  hunterPower: number,
  recommendedPower: number
): number {
  if (recommendedPower <= 0) return 50
  const ratio = hunterPower / recommendedPower
  return Math.min(99, Math.max(8, Math.round(ratio * 82)))
}

export function estimatedDungeonTimeLimitMinutes(encounterCount: number): number {
  return Math.max(5, encounterCount * 4 + 2)
}
