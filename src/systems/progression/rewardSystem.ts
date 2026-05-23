import type {
  QuestRewardContract,
  QuestRewardItemContract,
} from "@/contracts/quest-contract"
import { clampXpReward } from "./xpSystem"

export interface QuestRewardPayload {
  xp: number
  credits?: number
  items?: (string | QuestRewardItemContract)[]
  unlocks?: string[]
}

export function calculateQuestReward(
  rewards: QuestRewardContract,
  rewardMultiplier = 1
): QuestRewardPayload {
  const baseXp = Math.floor(rewards.xp * rewardMultiplier)

  return {
    xp: clampXpReward(baseXp),
    credits: rewards.credits,
    items: rewards.items,
    unlocks: rewards.unlocks,
  }
}
