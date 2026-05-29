import type { PlayerContract } from "@/contracts/player-contract"
import type { QuestContract } from "@/contracts/quest-contract"
import { isTrainingQuest } from "@/systems/training/trainingMissionSystem"

export const DISCIPLINE_REWARDS = {
  TRAINING_COMPLETE: 3,
  DAILY_CONTRACT: 4,
  SIDE_CONTRACT: 5,
  MAIN_CONTRACT: 6,
  DUNGEON_COMPLETE: 8,
} as const

export function disciplineEarnedForQuest(quest: QuestContract): number {
  if (isTrainingQuest(quest)) return DISCIPLINE_REWARDS.TRAINING_COMPLETE
  if (quest.type === "DUNGEON") return DISCIPLINE_REWARDS.DUNGEON_COMPLETE
  if (quest.narrativeTier === "DAILY") return DISCIPLINE_REWARDS.DAILY_CONTRACT
  if (quest.narrativeTier === "MAIN") return DISCIPLINE_REWARDS.MAIN_CONTRACT
  return DISCIPLINE_REWARDS.SIDE_CONTRACT
}

export function applyDisciplineEarn(
  player: PlayerContract,
  amount: number
): PlayerContract {
  if (amount <= 0) return player
  return {
    ...player,
    progression: {
      ...player.progression,
      discipline: player.progression.discipline + amount,
    },
  }
}

export function canSpendDiscipline(player: PlayerContract, cost: number): boolean {
  return player.progression.discipline >= cost
}
