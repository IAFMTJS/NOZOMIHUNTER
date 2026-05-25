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

const DAILY_MODES: GameModeId[] = ["SIGNAL_CALIBRATION", "MEMORY_CASCADE"]
const STORY_MODES: GameModeId[] = [
  "LOST_TRANSMISSION",
  "GHOST_INTERROGATION",
  "TERMINAL_BREACH",
]
const SIDE_MODES: GameModeId[] = [
  "GHOST_INTERROGATION",
  "PANIC_CHANNEL",
  "TERMINAL_BREACH",
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

  return assignChannelGameMode(
    generateQuestForPlayer(player.level, player.progression.unlockedSystems),
    "story",
    player
  )
}
