import type { PendingRewardBundleContract } from "@/contracts/economy-contract"
import type { QuestContract } from "@/contracts/quest-contract"
import {
  ceremonyTierFromNarrative,
  revealModeForTier,
  type CompletionCeremonyContext,
  type CompletionCeremonyTier,
} from "./ceremonyTypes"

export function resolveCompletionCeremony(
  bundle: PendingRewardBundleContract,
  quests: QuestContract[]
): CompletionCeremonyContext {
  const quest = bundle.questId
    ? quests.find((q) => q.id === bundle.questId)
    : undefined
  const isDungeon = quest?.type === "DUNGEON"
  const tier = ceremonyTierFromNarrative(quest?.narrativeTier, isDungeon)
  return {
    tier,
    revealMode: revealModeForTier(tier),
    sourceTitle: quest?.title,
    narrativeTier: quest?.narrativeTier,
  }
}

export function overlayIntensityClass(tier: CompletionCeremonyTier): string {
  switch (tier) {
    case "light":
      return "nozomi-completion-light"
    case "medium":
      return "nozomi-completion-medium"
    case "dungeon":
      return "nozomi-completion-dungeon"
    default:
      return "nozomi-completion-full"
  }
}
