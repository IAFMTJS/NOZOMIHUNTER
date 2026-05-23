import type {
  QuestNarrativeTier,
  QuestRewardContract,
} from "@/contracts/quest-contract"

export function buildQuestRewards(
  playerLevel: number,
  tier: QuestNarrativeTier = "SIDE"
): QuestRewardContract {
  const main = tier === "MAIN"
  const xp = main
    ? playerLevel < 5
      ? 70
      : playerLevel < 15
        ? 90
        : 110
    : playerLevel < 5
      ? 50
      : playerLevel < 15
        ? 65
        : 80
  const credits = main ? 20 + playerLevel * 3 : 8 + playerLevel * 2
  const items =
    playerLevel >= 4
      ? [{ itemKey: main ? "signal-cache" : "shadow-shard", quantity: main ? 2 : 1 }]
      : undefined

  return { xp, credits, items }
}

export function hiddenScoutObjective() {
  return {
    id: "obj-scout",
    description: "Trace the signal origin",
    currentProgress: 0,
    requiredProgress: 1,
    completed: false,
    hidden: true,
    revealAt: 1,
  }
}
