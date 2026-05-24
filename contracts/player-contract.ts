import type {
  InventorySlotContract,
  PendingRewardBundleContract,
  PlayerEconomyContract,
} from "./economy-contract"

export interface HunterIdentityContract {
  codename: string
  registryId: string
}

export type SynchronizationStatus =
  | "STABLE"
  | "AT_RISK"
  | "BROKEN"
  | "DORMANT"

export interface SynchronizationContract {
  chainDays: number
  lastActiveDate: string | null
  status: SynchronizationStatus
  atRisk: boolean
}

export interface PlayerContract {
  id: string

  username: string

  identity: HunterIdentityContract

  synchronization: SynchronizationContract

  level: number
  xp: number
  rank: HunterRank

  stats: PlayerStatsContract

  /** Combat core stats (STR/AGI/INT/VIT) — persisted on progression. */
  rpgStats: RpgStatsContract

  penalties: PlayerPenaltyContract

  progression: PlayerProgressionContract

  economy: PlayerEconomyContract

  inventory: InventorySlotContract[]

  trackedQuestId: string | null

  pendingRewards: PendingRewardBundleContract | null

  createdAt: string
  updatedAt: string
}

export type HunterRank =
  | "E"
  | "D"
  | "C"
  | "B"
  | "A"
  | "S"

export interface PlayerStatsContract {
  vocabulary: number
  grammar: number
  listening: number
  speaking: number

  confidence: number
  intelligence: number
  consistency: number
}

export interface RpgStatsContract {
  strength: number
  agility: number
  intelligence: number
  vitality: number
}

export interface PlayerPenaltyContract {
  corruption: number
  fatigue: number
  xpDebt: number
}

export interface PlayerProgressionContract {
  unlockedDungeons: string[]
  unlockedSystems: string[]
  titles: string[]
  /** Learner assist visibility — FULL shows romaji/meanings; BLACKOUT hides assists. */
  assistLevel?: import("./game-mode-contract").AssistLevel
}