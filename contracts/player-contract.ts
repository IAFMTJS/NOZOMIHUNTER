import type {
  InventorySlotContract,
  PendingRewardBundleContract,
  PlayerEconomyContract,
} from "./economy-contract"
import type { StoryProgressContract } from "./narrative-contract"

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

  /** Season narrative state — persisted in player_story_progress when synced. */
  storyProgress?: StoryProgressContract

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
  | "SS"
  | "SSS"

/** Home command-node primary goal (GDD "almost there"). */
export interface AlmostThereObjectiveContract {
  title: string
  progressPercent: number
  detailLine: string
  contractsRemaining: number | null
  ctaHref: string
  ctaLabel: string
}

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
  /** Secondary meta currency (GDD discipline system). */
  discipline: number
  /** SSS prestige resets completed. */
  prestigeCount?: number
  /** Learner assist visibility — FULL shows romaji/meanings; BLACKOUT hides assists. */
  assistLevel?: import("./game-mode-contract").AssistLevel
}