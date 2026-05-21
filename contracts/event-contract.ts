export interface GameEventContract {
  id: string

  type: GameEventType

  timestamp: string

  payload: unknown
}

export type GameEventType =
  | "QUEST_COMPLETED"
  | "LEVEL_UP"
  | "RANK_UP"
  | "DUNGEON_ENTERED"
  | "DUNGEON_COMPLETED"
  | "PENALTY_TRIGGERED"
  | "SPEECH_ANALYZED"
  | "AI_RESPONSE_GENERATED"