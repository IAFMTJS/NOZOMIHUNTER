import type { QuestRewardContract } from "@/contracts/quest-contract"
import { clampXpReward } from "./xpSystem"

export interface QuestRewardPayload {
  xp: number
  credits?: number
  items?: string[]
  unlocks?: string[]
}

export function calculateQuestReward(
  rewards: QuestRewardContract,
  difficultyMultiplier = 1
): QuestRewardPayload {
  const baseXp = Math.floor(rewards.xp * difficultyMultiplier)

  return {
    xp: clampXpReward(baseXp),
    credits: rewards.credits,
    items: rewards.items,
    unlocks: rewards.unlocks,
  }
}
