export interface PlayerContract {
  id: string

  username: string

  level: number
  xp: number
  rank: HunterRank

  stats: PlayerStatsContract

  penalties: PlayerPenaltyContract

  progression: PlayerProgressionContract

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

export interface PlayerPenaltyContract {
  corruption: number
  fatigue: number
  xpDebt: number
}

export interface PlayerProgressionContract {
  unlockedDungeons: string[]
  unlockedSystems: string[]
  titles: string[]
}