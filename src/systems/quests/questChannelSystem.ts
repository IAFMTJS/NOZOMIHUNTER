import type { QuestContract, QuestRequestChannel } from "@/contracts/quest-contract"
import type { PlayerContract } from "@/contracts/player-contract"
import type { GameModeId } from "@/contracts/game-mode-contract"
import { generateDailyQuest, findActiveDailyQuest, utcDateKey } from "./dailyQuestSystem"
import {
  generateVocabularyQuest,
  generateConversationQuest,
  generateQuestForPlayer,
} from "./questGenerator"
import { buildQuestRewards } from "./questRewardFactory"
import { pickWeightedGameMode } from "@/systems/gameModes/gameModeSystem"
import { applyGameModeToQuest } from "@/systems/gameModes/gameModeQuestBuilder"
import { hashSeed } from "@/systems/economy/shopRotationHash"
import {
  pickContentContractTemplate,
  buildQuestFromContentTemplate,
} from "@/systems/content/contentContractTemplateSystem"

const DAILY_MODES: GameModeId[] = ["SIGNAL_CALIBRATION", "MEMORY_CASCADE"]
const STORY_MODES: GameModeId[] = [
  "LOST_TRANSMISSION",
  "GHOST_INTERROGATION",
  "TERMINAL_BREACH",
]
const SIDE_MODES: GameModeId[] = [
  "ENTITY_HUNT",
  "SEMANTIC_NETWORK",
  "GHOST_INTERROGATION",
  "PANIC_CHANNEL",
  "TERMINAL_BREACH",
  "DEEP_COVER",
]

export function meetsQuestRequirements(
  quest: QuestContract,
  player: PlayerContract
): boolean {
  const min = quest.requirements?.find((r) => r.minimumLevel != null)?.minimumLevel
  if (min != null && player.level < min) return false
  return true
}

export function assignChannelGameMode(
  quest: QuestContract,
  channel: QuestRequestChannel,
  player: PlayerContract
): QuestContract {
  const pool =
    channel === "daily"
      ? DAILY_MODES
      : channel === "story"
        ? STORY_MODES
        : SIDE_MODES
  const mode = pickWeightedGameMode(pool, player)
  if (mode === "STANDARD") return quest
  return applyGameModeToQuest({ ...quest, gameMode: mode }, mode)
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
    const dailyTemplate = pickContentContractTemplate("daily", player.id, date)
    if (dailyTemplate && hashSeed(`${player.id}:daily`) % 100 < 70) {
      const quest = buildQuestFromContentTemplate(dailyTemplate, player)
      if (meetsQuestRequirements(quest, player)) {
        return quest.gameMode ? quest : assignChannelGameMode(quest, "daily", player)
      }
    }
    return assignChannelGameMode(
      generateDailyQuest(
        player.id,
        player.level,
        player.progression.unlockedSystems,
        date
      ),
      "daily",
      player
    )
  }

  if (channel === "side") {
    const template = pickContentContractTemplate("side", player.id, date)
    if (template && hashSeed(`${player.id}:side`) % 100 < 70) {
      const quest = buildQuestFromContentTemplate(template, player)
      if (meetsQuestRequirements(quest, player)) {
        return quest.gameMode
          ? quest
          : assignChannelGameMode(quest, "side", player)
      }
    }
    const roll = Math.random()
    const base =
      roll < 0.35
        ? generateConversationQuest(player.level)
        : generateVocabularyQuest(player.level)
    return assignChannelGameMode(
      {
        ...base,
        narrativeTier: "SIDE" as const,
        rewards: buildQuestRewards(player.level, "SIDE"),
      },
      "side",
      player
    )
  }

  const storyTemplate = pickContentContractTemplate("story", player.id, date)
  if (storyTemplate && hashSeed(`${player.id}:story`) % 100 < 70) {
    const quest = buildQuestFromContentTemplate(storyTemplate, player)
    if (meetsQuestRequirements(quest, player)) {
      return quest.gameMode ? quest : assignChannelGameMode(quest, "story", player)
    }
  }

  return assignChannelGameMode(
    generateQuestForPlayer(player.level, player.progression.unlockedSystems),
    "story",
    player
  )
}
