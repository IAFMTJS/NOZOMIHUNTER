import { getActiveSectorEvent, sectorEventXpMultiplier } from "@/config/eventScheduleConfig"
import type { QuestContract, QuestRewardContract } from "@/contracts/quest-contract"

export interface LiveRewardModifiers {
  xpMultiplier: number
  creditsBonus: number
  eventTitle: string | null
}

export function resolveLiveRewardModifiers(seed: string): LiveRewardModifiers {
  const event = getActiveSectorEvent(seed)
  const xpMultiplier = sectorEventXpMultiplier(event)
  const creditsBonus = event?.bonusXpPercent
    ? Math.floor(event.bonusXpPercent / 3)
    : 0
  return {
    xpMultiplier,
    creditsBonus,
    eventTitle: event?.title ?? null,
  }
}

export function applyLiveModifiersToQuestRewards(
  rewards: QuestRewardContract,
  mods: LiveRewardModifiers
): QuestRewardContract {
  if (mods.xpMultiplier <= 1 && mods.creditsBonus <= 0) return rewards
  return {
    ...rewards,
    xp: Math.floor((rewards.xp ?? 0) * mods.xpMultiplier),
    credits: (rewards.credits ?? 0) + mods.creditsBonus,
  }
}

export function applyLiveModifiersToQuest(
  quest: QuestContract,
  mods: LiveRewardModifiers
): QuestContract {
  return {
    ...quest,
    rewards: applyLiveModifiersToQuestRewards(quest.rewards, mods),
  }
}
