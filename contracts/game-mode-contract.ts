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
  | "ECHO_LISTENING"
  | "SHADOW_TYPING"
  | "MEMORY_GRID"
  | "SURVIVAL_VOCAB"

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

export type DungeonModifierKind =
  | "BLACKOUT"
  | "ECHOING_WALLS"
  | "BLOOD_MOON"
  | "ARCHIVE_FOG"
  | "HUNTERS_MARK"
  | "SILENT_SECTOR"
  | "UNSTABLE_GLYPHS"
  | "GENERIC"

export interface DungeonModifierContract {
  id: string
  label: string
  kind?: DungeonModifierKind
  /** e.g. timer shrink multiplier */
  timerMultiplier?: number
  replayBan?: boolean
  corruptionMutation?: number
  /** Hide romaji unless player used SCAN intel (BLACKOUT). */
  blackoutRomaji?: boolean
  /** Auto-replay listening once; disables manual replay (ECHOING_WALLS). */
  autoEchoReplay?: boolean
  /** Double corruption gains (BLOOD_MOON). */
  corruptionGainMultiplier?: number
  /** Hide meanings on route scan copy (ARCHIVE_FOG). */
  archiveFogOnScan?: boolean
  /** Elevated boss awareness from weak-word spotlight (HUNTER'S MARK). */
  huntersMark?: boolean
}
