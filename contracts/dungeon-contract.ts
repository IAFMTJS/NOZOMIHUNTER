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

export interface DungeonRewardContract {
  xp: number

  items?: string[]

  unlocks?: string[]
}

export interface DungeonPenaltyContract {
  corruption: number
  fatigue: number
}