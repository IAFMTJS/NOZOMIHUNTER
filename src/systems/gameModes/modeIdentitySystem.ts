import type { GameModeId } from "@/contracts/game-mode-contract"
import type { QuestContract } from "@/contracts/quest-contract"
import { GAME_MODE_REGISTRY } from "@/config/gameModeRegistry"

/** Unique encounter payload per mode (GDD identity test). */
const MODE_PAYLOAD_KEYS: Partial<Record<GameModeId, (q: QuestContract) => boolean>> = {
  TERMINAL_BREACH: (q) => q.terminalBreachEncounter != null,
  GHOST_INTERROGATION: (q) =>
    q.gameMode === "GHOST_INTERROGATION" && q.conversationEncounter != null,
  PANIC_CHANNEL: (q) => q.conversationEncounter?.panicMode === true,
  DEEP_COVER: (q) => q.conversationEncounter?.relationshipTrust != null,
  SEMANTIC_NETWORK: (q) => q.semanticNetworkEncounter != null,
  ENTITY_HUNT: (q) => q.gameMode === "ENTITY_HUNT" && q.vocabularyEncounter != null,
  SIGNAL_CALIBRATION: (q) => q.listeningEncounter?.channelIsolated != null,
  SHADOW_ECHO: (q) => q.speechEncounter != null,
  MEMORY_CASCADE: (q) => q.memoryCascadeEncounter != null,
  KANJI_SURGERY: (q) => q.kanjiSurgeryEncounter != null,
  KANA_DASH: (q) => q.vocabularyEncounter != null,
  ECHO_LISTENING: (q) =>
    q.echoListeningEncounter != null || q.listeningEncounter?.channelIsolated != null,
  SHADOW_TYPING: (q) =>
    q.gameMode === "SHADOW_TYPING" && q.vocabularyEncounter != null,
  MEMORY_GRID: (q) => q.memoryGridEncounter != null,
  SURVIVAL_VOCAB: (q) =>
    q.gameMode === "SURVIVAL_VOCAB" && q.vocabularyEncounter != null,
  LOST_TRANSMISSION: (q) =>
    q.listeningEncounter != null &&
    (q.listeningEncounter.timelineKeywords?.length ?? 0) > 0,
  VOID_PURSUIT: (q) => q.dungeonRun?.pursuitDistance != null,
  CORRUPTION_RUN: (q) => q.dungeonRun?.endlessSectorCount != null,
  ROGUELIKE_SECTOR: (q) =>
    (q.dungeonRun?.modifiers?.length ?? 0) > 0 || q.dungeonRun?.dungeonMode === "ROGUELIKE_SECTOR",
  ARCHIVIST_BOSS: (q) =>
    q.dungeonRun?.bossPhase != null && q.dungeonRun.activeType === "BOSS",
}

export function modeHasUniquePayload(mode: GameModeId, quest: QuestContract): boolean {
  const check = MODE_PAYLOAD_KEYS[mode]
  if (check) return check(quest)
  const def = GAME_MODE_REGISTRY[mode]
  return Object.keys(def.pressure ?? {}).length > 0
}

export function assertModeIdentity(mode: GameModeId, quest: QuestContract): boolean {
  if (quest.gameMode !== mode && mode !== "STANDARD") return false
  return modeHasUniquePayload(mode, quest)
}
