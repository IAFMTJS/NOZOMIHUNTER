import type { RewardIconItem } from "@/components/ui/screen/RewardIconGrid"

type RewardAudioCue = "confirm" | "questComplete" | "sectorClear" | "rewardTick"

export const REWARD_REVEAL_STAGGER_MS = 520

export function audioCueForRewardItem(item: RewardIconItem, index: number): RewardAudioCue {
  if (item.tone === "xp") return index === 0 ? "questComplete" : "rewardTick"
  if (item.tone === "credits") return "sectorClear"
  return "rewardTick"
}
