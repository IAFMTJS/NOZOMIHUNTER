import type { GameModeId } from "@/contracts/game-mode-contract"
import type { QuestContract } from "@/contracts/quest-contract"
import type { DungeonRunContract } from "@/contracts/dungeon-contract"
import type { PlayerContract } from "@/contracts/player-contract"
import type { AssistLevel } from "@/contracts/game-mode-contract"
import {
  GAME_MODE_REGISTRY,
  getGameModeDefinition,
  isGameModeUnlocked,
} from "@/config/gameModeRegistry"

export function resolveQuestGameMode(quest: QuestContract): GameModeId {
  return quest.gameMode ?? "STANDARD"
}

export function resolveDungeonGameMode(run: DungeonRunContract): GameModeId {
  return run.dungeonMode ?? "STANDARD"
}

export function defaultGameModeForQuestType(_type: QuestContract["type"]): GameModeId {
  return "STANDARD"
}

export function canPlayGameMode(
  modeId: GameModeId,
  player: PlayerContract
): boolean {
  return isGameModeUnlocked(modeId, player)
}

export function effectiveAssistLevel(
  player: PlayerContract,
  modeId: GameModeId
): AssistLevel {
  const profile = getGameModeDefinition(modeId).pressure
  const base = player.progression.assistLevel ?? "FULL"
  if (profile.hideAssists || base === "BLACKOUT") return "BLACKOUT"
  if (base === "REDUCED") return "REDUCED"
  return "FULL"
}

export function pickWeightedGameMode(
  candidates: GameModeId[],
  player: PlayerContract
): GameModeId {
  const unlocked = candidates.filter((id) => canPlayGameMode(id, player))
  if (unlocked.length === 0) return "STANDARD"
  return unlocked[Math.floor(Math.random() * unlocked.length)]!
}

export function gameModeLabel(modeId: GameModeId): string {
  return GAME_MODE_REGISTRY[modeId].label
}
