import { FEATURE_FLAGS } from "@/config/features"
import type {
  GameModeEmotion,
  GameModeId,
  GameModeParentSystem,
  GameModePressureProfile,
} from "@/contracts/game-mode-contract"
import type { EncounterType } from "@/contracts/dungeon-contract"
import type { QuestType } from "@/contracts/quest-contract"
import type { PlayerContract } from "@/contracts/player-contract"

export interface GameModeDefinition {
  id: GameModeId
  label: string
  emotion: GameModeEmotion
  parentSystem: GameModeParentSystem
  questType?: QuestType
  sectorType?: EncounterType
  minLevel: number
  unlockKey?: string
  featureFlag?: keyof typeof FEATURE_FLAGS
  pressure: GameModePressureProfile
  enabled: boolean
}

export const GAME_MODE_REGISTRY: Record<GameModeId, GameModeDefinition> = {
  STANDARD: {
    id: "STANDARD",
    label: "Standard",
    emotion: "PRIDE",
    parentSystem: "quest",
    minLevel: 1,
    pressure: {},
    enabled: true,
  },
  SIGNAL_CALIBRATION: {
    id: "SIGNAL_CALIBRATION",
    label: "Signal Calibration",
    emotion: "DISCIPLINE",
    parentSystem: "training",
    questType: "LISTENING",
    minLevel: 2,
    pressure: { timed: true },
    enabled: true,
  },
  KANJI_SURGERY: {
    id: "KANJI_SURGERY",
    label: "Kanji Surgery",
    emotion: "DISCIPLINE",
    parentSystem: "training",
    questType: "VOCABULARY",
    minLevel: 3,
    pressure: { corruptionSensitive: true },
    enabled: true,
  },
  MEMORY_CASCADE: {
    id: "MEMORY_CASCADE",
    label: "Memory Cascade",
    emotion: "DISCIPLINE",
    parentSystem: "training",
    questType: "VOCABULARY",
    minLevel: 2,
    pressure: { timed: true },
    enabled: true,
  },
  SHADOW_ECHO: {
    id: "SHADOW_ECHO",
    label: "Shadow Echo",
    emotion: "DISCIPLINE",
    parentSystem: "training",
    questType: "SPEECH",
    minLevel: 3,
    pressure: {},
    enabled: true,
  },
  TERMINAL_BREACH: {
    id: "TERMINAL_BREACH",
    label: "Terminal Breach",
    emotion: "CURIOSITY",
    parentSystem: "quest",
    questType: "VOCABULARY",
    minLevel: 4,
    pressure: { corruptionSensitive: true },
    enabled: true,
  },
  GHOST_INTERROGATION: {
    id: "GHOST_INTERROGATION",
    label: "Ghost Interrogation",
    emotion: "CURIOSITY",
    parentSystem: "quest",
    questType: "CONVERSATION",
    minLevel: 3,
    pressure: { timed: false },
    enabled: true,
  },
  LOST_TRANSMISSION: {
    id: "LOST_TRANSMISSION",
    label: "Lost Transmission",
    emotion: "CURIOSITY",
    parentSystem: "quest",
    questType: "LISTENING",
    minLevel: 4,
    pressure: {},
    enabled: true,
  },
  CORRUPTION_RUN: {
    id: "CORRUPTION_RUN",
    label: "Corruption Run",
    emotion: "SURVIVAL",
    parentSystem: "dungeon",
    minLevel: 5,
    unlockKey: "dungeon:corruption-run",
    pressure: {
      corruptionSensitive: true,
      survivalPresentation: true,
      hideAssists: false,
    },
    enabled: true,
  },
  VOID_PURSUIT: {
    id: "VOID_PURSUIT",
    label: "Void Pursuit",
    emotion: "SURVIVAL",
    parentSystem: "dungeon",
    minLevel: 6,
    unlockKey: "dungeon:void-pursuit",
    pressure: { survivalPresentation: true, timed: true },
    enabled: true,
  },
  ROGUELIKE_SECTOR: {
    id: "ROGUELIKE_SECTOR",
    label: "Roguelike Sectors",
    emotion: "SURVIVAL",
    parentSystem: "dungeon",
    minLevel: 7,
    unlockKey: "dungeon:roguelike-sector",
    pressure: { corruptionSensitive: true },
    enabled: true,
  },
  ARCHIVIST_BOSS: {
    id: "ARCHIVIST_BOSS",
    label: "The Archivist",
    emotion: "SPECTACLE",
    parentSystem: "dungeon",
    sectorType: "BOSS",
    minLevel: 8,
    pressure: { survivalPresentation: true },
    enabled: true,
  },
  DEEP_COVER: {
    id: "DEEP_COVER",
    label: "Deep Cover",
    emotion: "SOCIAL_PRESSURE",
    parentSystem: "contract",
    questType: "CONVERSATION",
    minLevel: 5,
    unlockKey: "system:deep-cover",
    pressure: {},
    enabled: true,
  },
  PANIC_CHANNEL: {
    id: "PANIC_CHANNEL",
    label: "Panic Channel",
    emotion: "SOCIAL_PRESSURE",
    parentSystem: "contract",
    questType: "CONVERSATION",
    minLevel: 4,
    pressure: { timed: true, corruptionSensitive: true },
    enabled: true,
  },
  ENTITY_HUNT: {
    id: "ENTITY_HUNT",
    label: "Entity Hunt",
    emotion: "DISCOVERY",
    parentSystem: "vocabulary",
    questType: "VOCABULARY",
    minLevel: 2,
    pressure: {},
    enabled: true,
  },
  SEMANTIC_NETWORK: {
    id: "SEMANTIC_NETWORK",
    label: "Semantic Network",
    emotion: "DISCOVERY",
    parentSystem: "vocabulary",
    minLevel: 4,
    unlockKey: "system:semantic-network",
    pressure: {},
    enabled: true,
  },
}

export function getGameModeDefinition(id: GameModeId): GameModeDefinition {
  return GAME_MODE_REGISTRY[id]
}

export function isGameModeUnlocked(
  modeId: GameModeId,
  player: PlayerContract
): boolean {
  const def = GAME_MODE_REGISTRY[modeId]
  if (!def.enabled) return false
  if (player.level < def.minLevel) return false
  if (def.featureFlag && !FEATURE_FLAGS[def.featureFlag]) return false
  if (def.unlockKey) {
    const systems = player.progression.unlockedSystems
    const dungeons = player.progression.unlockedDungeons
    if (
      !systems.includes(def.unlockKey) &&
      !dungeons.includes(def.unlockKey)
    ) {
      return false
    }
  }
  return true
}

export const TRAINING_GAME_MODES: GameModeId[] = [
  "SIGNAL_CALIBRATION",
  "KANJI_SURGERY",
  "MEMORY_CASCADE",
  "SHADOW_ECHO",
]

export const QUEST_GAME_MODES: GameModeId[] = [
  "TERMINAL_BREACH",
  "GHOST_INTERROGATION",
  "LOST_TRANSMISSION",
]

export const DUNGEON_GAME_MODES: GameModeId[] = [
  "CORRUPTION_RUN",
  "VOID_PURSUIT",
  "ROGUELIKE_SECTOR",
]
