export const GAME_EVENTS = {
  QUEST_ACCEPTED: "QUEST_ACCEPTED",
  QUEST_COMPLETED: "QUEST_COMPLETED",
  QUEST_FAILED: "QUEST_FAILED",
  XP_GAINED: "XP_GAINED",
  LEVEL_UP: "LEVEL_UP",
  RANK_UP: "RANK_UP",
  PENALTY_TRIGGERED: "PENALTY_TRIGGERED",
  DUNGEON_ENTERED: "DUNGEON_ENTERED",
  DUNGEON_COMPLETED: "DUNGEON_COMPLETED",
  DUNGEON_FAILED: "DUNGEON_FAILED",
  ENCOUNTER_STARTED: "ENCOUNTER_STARTED",
  ENCOUNTER_COMPLETED: "ENCOUNTER_COMPLETED",
  ENCOUNTER_ANSWER_CORRECT: "ENCOUNTER_ANSWER_CORRECT",
  ENCOUNTER_ANSWER_WRONG: "ENCOUNTER_ANSWER_WRONG",
  SPEECH_RECORDED: "SPEECH_RECORDED",
  SPEECH_ANALYZED: "SPEECH_ANALYZED",
  AI_RESPONSE_GENERATED: "AI_RESPONSE_GENERATED",
  MESSAGE_RECEIVED: "MESSAGE_RECEIVED",
  SAVE_TRIGGERED: "SAVE_TRIGGERED",
  AUTOSAVE_COMPLETED: "AUTOSAVE_COMPLETED",
  VOCABULARY_MASTERED: "VOCABULARY_MASTERED",
  VOCABULARY_PREPARATION_READY: "VOCABULARY_PREPARATION_READY",
  UNLOCK_GRANTED: "UNLOCK_GRANTED",
  SYNC_MAINTAINED: "SYNC_MAINTAINED",
  SYNC_DECAY_WARNING: "SYNC_DECAY_WARNING",
  STAMINA_SPENT: "STAMINA_SPENT",
  STAMINA_REFUNDED: "STAMINA_REFUNDED",
  ITEM_GRANTED: "ITEM_GRANTED",
  SHOP_PURCHASED: "SHOP_PURCHASED",
  SHOP_ITEM_SOLD: "SHOP_ITEM_SOLD",
  BOOST_ACTIVATED: "BOOST_ACTIVATED",
  XP_CONVERTED: "XP_CONVERTED",
  REWARDS_PENDING: "REWARDS_PENDING",
  REWARDS_CLAIMED: "REWARDS_CLAIMED",
  WORD_BREWED: "WORD_BREWED",
  QUEST_TRACKED: "QUEST_TRACKED",
  EXPLORATION_BEAT_ADVANCED: "EXPLORATION_BEAT_ADVANCED",
  CHALLENGE_REVEALED: "CHALLENGE_REVEALED",
  REPLAY_PENALTY: "REPLAY_PENALTY",
} as const

export type GameEventType = (typeof GAME_EVENTS)[keyof typeof GAME_EVENTS]

export interface GameEventContract<TPayload = unknown> {
  id: string
  type: GameEventType
  timestamp: string
  payload: TPayload
}

export type QuestCompletedPayload = { playerId: string; questId: string }
export type XpGainedPayload = {
  playerId: string
  xpGained: number
  totalXp: number
}
export type LevelUpPayload = {
  playerId: string
  level: number
  previousLevel: number
  statDeltas?: { label: string; delta: number }[]
  unlockKeys?: string[]
}

export type EncounterAnswerCorrectPayload = {
  questId: string
  wordId?: string | null
  encounterComplete?: boolean
  correctStreak?: number
}

export type EncounterAnswerWrongPayload = {
  questId: string
  wordId?: string | null
  encounterFailed?: boolean
  previousStreak?: number
}
export type RankUpPayload = { playerId: string; rank: string }
export type DungeonCompletedPayload = {
  playerId: string
  dungeonId: string
  xp: number
}
export type RewardsPendingPayload = {
  playerId: string
  pending: unknown
  xpGained: number
}
export type ItemGrantedPayload = {
  playerId: string
  itemKey: string
  quantity: number
}
export type StaminaSpentPayload = {
  playerId: string
  amount: number
  dungeonKey: string | null
}
export type ShopPurchasedPayload = {
  playerId: string
  itemKey: string
  quantity: number
  spent: number
}
export type ShopItemSoldPayload = {
  playerId: string
  itemKey: string
  quantity: number
  gained: number
}
export type BoostActivatedPayload = {
  playerId: string
  itemKey: string
  effectType: string
}
export type XpConvertedPayload = {
  playerId: string
  xpSpent: number
  creditsGained: number
}
