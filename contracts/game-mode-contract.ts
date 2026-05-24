/** Distinct gameplay modes — see gameModeRegistry for metadata. */
export type GameModeId =
  | "STANDARD"
  | "SIGNAL_CALIBRATION"
  | "KANJI_SURGERY"
  | "MEMORY_CASCADE"
  | "SHADOW_ECHO"
  | "KANA_DASH"
  | "TERMINAL_BREACH"
  | "GHOST_INTERROGATION"
  | "LOST_TRANSMISSION"
  | "CORRUPTION_RUN"
  | "VOID_PURSUIT"
  | "ROGUELIKE_SECTOR"
  | "ARCHIVIST_BOSS"
  | "DEEP_COVER"
  | "PANIC_CHANNEL"
  | "ENTITY_HUNT"
  | "SEMANTIC_NETWORK"

export type GameModeEmotion =
  | "DISCIPLINE"
  | "CURIOSITY"
  | "SURVIVAL"
  | "SOCIAL_PRESSURE"
  | "DISCOVERY"
  | "SPECTACLE"
  | "ANXIETY"
  | "DOPAMINE"
  | "PRIDE"

export type GameModeParentSystem =
  | "training"
  | "quest"
  | "dungeon"
  | "contract"
  | "vocabulary"

export type AssistLevel = "FULL" | "REDUCED" | "BLACKOUT"

export interface GameModePressureProfile {
  hideAssists?: boolean
  corruptionSensitive?: boolean
  timed?: boolean
  survivalPresentation?: boolean
}

export interface DungeonModifierContract {
  id: string
  label: string
  /** e.g. timer shrink multiplier */
  timerMultiplier?: number
  replayBan?: boolean
  corruptionMutation?: number
}
