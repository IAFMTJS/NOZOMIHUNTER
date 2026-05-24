export interface DungeonContract {
  id: string

  name: string
  description: string

  theme: DungeonTheme

  difficulty: DungeonDifficulty

  encounters: DungeonEncounterContract[]

  boss?: DungeonBossContract

  rewards: DungeonRewardContract

  penalties: DungeonPenaltyContract

  multiplayerEnabled: boolean
}

export type DungeonTheme =
  | "CYBER_TOKYO"
  | "ABANDONED_STATION"
  | "CORRUPTED_SHRINE"
  | "NEON_CITY"
  | "SHADOW_ARCHIVE"
  | "ABYSS_CORE"

export type DungeonDifficulty =
  | "RANK_E"
  | "RANK_D"
  | "RANK_C"
  | "RANK_B"
  | "RANK_A"
  | "RANK_S"

export interface DungeonEncounterContract {
  id: string

  type: EncounterType

  difficulty: number

  completed: boolean
}

export type EncounterType =
  | "VOCAB"
  | "LISTENING"
  | "SPEECH"
  | "NPC"
  | "BOSS"

export interface DungeonBossContract {
  id: string

  name: string

  phases: number

  speechDifficulty: number
  grammarDifficulty: number
}

export interface DungeonRewardItemContract {
  itemKey: string
  quantity: number
}

export interface DungeonRewardContract {
  xp: number
  credits?: number
  items?: (string | DungeonRewardItemContract)[]
  unlocks?: string[]
}

export interface DungeonPenaltyContract {
  corruption: number
  fatigue: number
}

export type ExplorationBeat = "APPROACH" | "SCAN" | "ENGAGE"

export type ExplorationAction = "LISTEN" | "PUSH"

/** Live dungeon run state — persisted on DUNGEON quest snapshots. */
export interface DungeonRunContract {
  dungeon: DungeonContract
  machineState: DungeonMachineState
  currentEncounterIndex: number
  activeType: EncounterType | "BOSS" | null
  encounterFailures: number
  bossPhase: number
  /** Stamina deducted on enter — refunded on abort when set. */
  staminaSpent?: number
  /** ISO timestamp when the run timer started (deploy). */
  runStartedAt?: string
  /** Total allowed run time in ms before timeout failure. */
  timeLimitMs?: number
  /** Accumulated freeze extension ms (Time Freeze consumable). */
  frozenTimeMs?: number
  /** While set and in the future, the run timer is paused. */
  frozenUntil?: string | null
  /** Corridor traversal progress (0–100) while in EXPLORATION. */
  explorationProgress?: number
  /** Current exploration beat before sector engagement. */
  explorationBeat?: ExplorationBeat | null
  /** Whether tactical intel was revealed during SCAN. */
  sectorIntelRevealed?: boolean
}

export type DungeonMachineState =
  | "PREPARATION"
  | "EXPLORATION"
  | "ENCOUNTER"
  | "REWARD"
  | "BOSS"
  | "EXTRACTION"
  | "COMPLETE"
  | "FAILURE"