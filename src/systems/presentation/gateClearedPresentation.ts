import type { GateClearedStats } from "@/systems/presentation/ceremonies/ceremonyTypes"
import type { RewardIconItem } from "@/components/ui/screen/RewardIconGrid"
import type { PendingRewardBundleContract } from "@/contracts/economy-contract"

export function gradeFromAccuracy(accuracyPercent: number): string {
  if (accuracyPercent >= 95) return "S"
  if (accuracyPercent >= 85) return "A"
  if (accuracyPercent >= 70) return "B"
  if (accuracyPercent >= 55) return "C"
  return "D"
}

export function rewardsFromPendingBundle(
  bundle: PendingRewardBundleContract
): RewardIconItem[] {
  const items: RewardIconItem[] = [
    {
      key: "xp",
      label: "XP",
      sublabel: `+${bundle.xpGained}`,
      tone: "xp",
    },
    {
      key: "words",
      label: "Word Data",
      sublabel: "Extracted",
      tone: "item",
    },
  ]
  if (bundle.credits != null && bundle.credits > 0) {
    items.push({
      key: "credits",
      label: "Tokens",
      sublabel: `+${bundle.credits}`,
      tone: "credits",
    })
  }
  if (bundle.items.length > 0) {
    items.push({
      key: "drops",
      label: "Drops",
      sublabel: `${bundle.items.length} item(s)`,
      tone: "neutral",
    })
  }
  return items
}

export function buildGateClearedStats(
  bundle: PendingRewardBundleContract,
  options?: { timeSeconds?: number; accuracyPercent?: number }
): GateClearedStats {
  const accuracy = options?.accuracyPercent ?? 85
  const sec = options?.timeSeconds ?? 0
  const mins = Math.floor(sec / 60)
  const rem = sec % 60
  return {
    timeLabel: `${mins}:${String(rem).padStart(2, "0")}`,
    accuracyPercent: accuracy,
    grade: gradeFromAccuracy(accuracy),
    newWordsUnlocked: bundle.items.length > 0 ? bundle.items.length : 12,
    masteryIncreasePercent: 8,
  }
}
