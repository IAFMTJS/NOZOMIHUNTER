import type { DungeonTheme } from "./dungeon-contract"

export type SectorId = string

export type SectorState =
  | "LOCKED"
  | "UNLOCKED"
  | "ACTIVE"
  | "CLEARED"
  | "CORRUPTED"
  | "CRITICAL"

export interface SectorCompletionMetrics {
  storyBeatsCleared: number
  storyBeatsTotal: number
  archiveRecoveryPercent: number
  bossClears: number
  contractCompletionPercent: number
}

export interface SectorDefinitionContract {
  id: SectorId
  index: number
  name: string
  nameJa: string
  jlptFocus: string
  canonBossName: string
  canonBossNameJa?: string
  primaryDungeonKeys: string[]
  wordPoolId: string
  heroTheme?: DungeonTheme
  minLevel: number
  description: string
}

export interface SectorViewContract extends SectorDefinitionContract {
  state: SectorState
  completion: SectorCompletionMetrics
}
