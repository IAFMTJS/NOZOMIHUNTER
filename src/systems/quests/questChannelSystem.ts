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
import {
  getNextStoryMission,
  seasonStoryMissionToTemplate,
} from "@/systems/content/seasonContentLoader"
import {
  getActiveLanguageInvasion,
  invasionCorruptionDrift,
} from "@/systems/retention/languageInvasionSystem"
import { eventBus } from "@/systems/events/eventBus"
import { GAME_EVENTS } from "@/systems/events/eventTypes"

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

  if (channel === "anomaly") {
    const seed = `${player.id}:${date}`
    const invasion = getActiveLanguageInvasion(seed)
    if (invasion) {
      eventBus.emit(GAME_EVENTS.LANGUAGE_INVASION_ACTIVE, {
        invasionId: invasion.id,
        corruptionDrift: invasionCorruptionDrift(invasion),
      })
      const base = generateVocabularyQuest(player.level)
      return assignChannelGameMode(
        {
          ...base,
          id: `anomaly-${player.id}-${date}`,
          title: invasion.headline,
          description: invasion.detail,
          narrativeTier: "SIDE" as const,
          rewards: buildQuestRewards(player.level, "SIDE"),
        },
        "side",
        player
      )
    }
    return generateQuestForChannel("side", player, activeQuests)
  }

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

  const nextStory = getNextStoryMission(player)
  if (nextStory) {
    const quest = buildQuestFromContentTemplate(
      seasonStoryMissionToTemplate(nextStory),
      player
    )
    if (meetsQuestRequirements(quest, player)) {
      return quest.gameMode ? quest : assignChannelGameMode(quest, "story", player)
    }
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
