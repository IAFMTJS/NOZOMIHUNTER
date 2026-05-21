export interface ProfileRow {
  id: string
  username: string
  created_at: string
  updated_at: string
}

export interface PlayerStatsRow {
  user_id: string
  vocabulary: number
  grammar: number
  listening: number
  speaking: number
  confidence: number
  intelligence: number
  consistency: number
}

export interface ProgressionRow {
  user_id: string
  level: number
  xp: number
  rank: string
  unlocked_systems: string[]
  unlocked_dungeons: string[]
  titles: string[]
}

export interface PlayerPenaltiesRow {
  user_id: string
  corruption: number
  fatigue: number
  xp_debt: number
}

export interface QuestRow {
  id: string
  type: string
  title: string
  description: string
  difficulty: string
  rewards: Record<string, unknown>
  penalties: Record<string, unknown> | null
  objectives: Record<string, unknown>[]
  requirements: Record<string, unknown> | null
}

export interface UserQuestRow {
  id: string
  user_id: string
  quest_id: string
  status: string
  progress: Record<string, unknown>
  quest_snapshot: Record<string, unknown>
  created_at: string
  updated_at: string
}

export interface ConversationRow {
  id: string
  user_id: string
  messages: Record<string, unknown>[]
  memory: Record<string, unknown>
  created_at: string
  updated_at: string
}
