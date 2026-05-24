import type { QuestContract } from "@/contracts/quest-contract"
import type { RewardIconItem } from "@/components/ui/screen/RewardIconGrid"

export function buildQuestRewardIcons(quest: QuestContract): RewardIconItem[] {
  const items: RewardIconItem[] = [
    {
      key: "xp",
      label: "XP",
      sublabel: `+${quest.rewards.xp}`,
      tone: "xp",
    },
    {
      key: "words",
      label: "Word Data",
      sublabel: quest.type === "VOCABULARY" ? "Extract" : "Scan",
      tone: "item",
    },
  ]

  if (quest.rewards.credits != null && quest.rewards.credits > 0) {
    items.push({
      key: "credits",
      label: "Tokens",
      sublabel: `+${quest.rewards.credits}`,
      tone: "credits",
    })
  } else {
    items.push({
      key: "tokens",
      label: "Hunter Tokens",
      sublabel: "Chance",
      tone: "credits",
    })
  }

  items.push({
    key: "drops",
    label: "Drops",
    sublabel: "Random",
    tone: "neutral",
  })

  return items
}

export function resolveQuestStaminaCost(quest: QuestContract): number {
  if (quest.type === "DUNGEON") return 20
  if (quest.type === "LISTENING") return 10
  if (quest.type === "SPEECH") return 12
  return 8
}
