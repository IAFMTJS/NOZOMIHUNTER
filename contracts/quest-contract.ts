export interface QuestContract {
  id: string

  type: QuestType

  title: string
  description: string

  difficulty: QuestDifficulty

  rewards: QuestRewardContract

  penalties?: QuestPenaltyContract

  objectives: QuestObjectiveContract[]

  requirements?: QuestRequirementContract[]

  hidden?: boolean
}

export type QuestType =
  | "VOCABULARY"
  | "LISTENING"
  | "SPEECH"
  | "GRAMMAR"
  | "DUNGEON"
  | "RAID"

export type QuestDifficulty =
  | "EASY"
  | "NORMAL"
  | "HARD"
  | "ELITE"
  | "NIGHTMARE"

export interface QuestRewardContract {
  xp: number
  credits?: number
  items?: string[]
  unlocks?: string[]
}

export interface QuestPenaltyContract {
  corruption?: number
  fatigue?: number
  xpDebt?: number
}

export interface QuestObjectiveContract {
  id: string

  description: string

  currentProgress: number
  requiredProgress: number

  completed: boolean
}

export interface QuestRequirementContract {
  minimumLevel?: number
  minimumRank?: string
  requiredDungeonClear?: string
}