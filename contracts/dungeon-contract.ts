import type { DungeonMasterId } from "./dungeon-master-contract"
import type { MasterDialogueMoment } from "./dungeon-master-contract"

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

  /** Sector intelligence overlay for this dungeon run. */
  masterId?: DungeonMasterId
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

export type DungeonAction =
  | "STRIKE"
  | "SEAL"
  | "COUNTER"
  | "FOCUS"
  | "ECHO"
  | "TRACE"

export type DungeonRouteNodeType = "ROUTE" | "ENCOUNTER" | "BOSS_GATE"

export type DungeonDangerLevel = "low" | "medium" | "high"

export interface DungeonRouteNode {
  id: string
  label: string
  type: DungeonRouteNodeType
  danger: DungeonDangerLevel
  rewardHint: string
  hazard?: string
  encounterType?: EncounterType
  exits: string[]
  requiredMasteryScore?: number
}

export interface DungeonRouteGraph {
  entryId: string
  nodes: Record<string, DungeonRouteNode>
}

export type DungeonBossEncounterKind =
  | "VOCAB"
  | "LISTENING"
  | "SPEECH"
  | "NPC"

export interface DungeonBossPhaseSpec {
  id: string
  label: string
  encounterKind: DungeonBossEncounterKind
  wordCount?: number
  fragmentCount?: number
}

export interface DungeonThreatState {
  corruptionPressure: number
  bossAwareness: number
  signalStability: number
  hunterFocus: number
}

export type DungeonExtractionChoice = "EXTRACT_SAFE" | "PUSH_DEEPER"

export interface DungeonWordExtractionEntry {
  wordId: string
  label: string
  fantasyState: "scanned" | "stabilized" | "sealed" | "bound" | "overlearned" | "unstable"
}

export interface DungeonRunSummary {
  wordsBound: DungeonWordExtractionEntry[]
  weakSignals: DungeonWordExtractionEntry[]
  bossSealLabel?: string
  techniqueLabel?: string
  runScore: number
}

export interface DungeonBossContract {
  id: string

  name: string

  phases: number

  speechDifficulty: number
  grammarDifficulty: number

  /** V2: structured boss phases (falls back to phases count when absent). */
  phaseSpecs?: DungeonBossPhaseSpec[]
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

import type { GameModeId, DungeonModifierContract } from "./game-mode-contract"

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
  /** Gameplay mode for this run. */
  dungeonMode?: GameModeId
  /** Roguelike modifiers active on this run. */
  modifiers?: DungeonModifierContract[]
  /** Void pursuit: 0 = caught, 100 = escaped. */
  pursuitDistance?: number
  /** Corruption run: sectors cleared in endless loop. */
  endlessSectorCount?: number
  /** Latest exploration system line for UI. */
  explorationSystemLine?: string
  /** Word ids cleared during this run (extraction mastery recap). */
  stabilizedWordIds?: string[]
  /** Highest correct-answer streak seen this run (XP multiplier at extract). */
  peakEncounterStreak?: number

  /** 2 = branching route / threat meters / combat actions (Neon Corridor V2). */
  runSchemaVersion?: 1 | 2
  threat?: DungeonThreatState
  routeGraph?: DungeonRouteGraph
  currentNodeId?: string
  completedNodeIds?: string[]
  /** Active run modifier (MVP: one per v2 run). */
  activeModifier?: DungeonModifierContract
  routeSelectPending?: boolean
  extractionChoicePending?: boolean
  pendingExtractionChoice?: DungeonExtractionChoice
  pushDeepBonusClaimed?: boolean
  wordExtractionLog?: DungeonWordExtractionEntry[]
  runScore?: number
  /** Player-selected combat action for current encounter. */
  selectedDungeonAction?: DungeonAction
  lastConsequenceLine?: string
  /** Resolved master for this run (mirrors dungeon.masterId). */
  masterId?: DungeonMasterId
  masterDialogueLine?: string
  masterDialogueMoment?: MasterDialogueMoment
  /** Boss phase integrity 0–100 (presentation + rules). */
  bossIntegrity?: number
  /** Run flags for master rules */
  firstMistakeLogged?: boolean
  lastAwarenessTier?: number
  lastCorruptionBand?: number
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