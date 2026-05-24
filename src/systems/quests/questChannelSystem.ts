import type { QuestContract, QuestRequestChannel } from "@/contracts/quest-contract"
import type { PlayerContract } from "@/contracts/player-contract"
import { generateDailyQuest, findActiveDailyQuest, utcDateKey } from "./dailyQuestSystem"
import {
  generateVocabularyQuest,
  generateConversationQuest,
  generateQuestForPlayer,
} from "./questGenerator"

export function meetsQuestRequirements(
  quest: QuestContract,
  player: PlayerContract
): boolean {
  const min = quest.requirements?.find((r) => r.minimumLevel != null)?.minimumLevel
  if (min != null && player.level < min) return false
  return true
}

export function generateQuestForChannel(
  channel: QuestRequestChannel,
  player: PlayerContract,
  activeQuests: QuestContract[]
): QuestContract {
  const date = utcDateKey()

  if (channel === "daily") {
    const existing = findActiveDailyQuest(activeQuests, player.id, date)
    if (existing) return existing
    return generateDailyQuest(
      player.id,
      player.level,
      player.progression.unlockedSystems,
      date
    )
  }

  if (channel === "side") {
    const roll = Math.random()
    const quest =
      roll < 0.35
        ? generateConversationQuest(player.level)
        : generateVocabularyQuest(player.level)
    return {
      ...quest,
      narrativeTier: "SIDE" as const,
      rewards: quest.rewards,
    }
  }

  return generateQuestForPlayer(
    player.level,
    player.progression.unlockedSystems
  )
}
