import type {
  ConversationEncounterContract,
  ListeningEncounterContract,
  SpeechEncounterContract,
  VocabularyEncounterContract,
} from "./encounter-contract"
import type { DungeonRunContract } from "./dungeon-contract"
import type { QuestVocabularyPreparationContract } from "./vocabulary-contract"

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

  /** Populated for VOCABULARY quests — encounter state persists in quest_snapshot. */
  vocabularyEncounter?: VocabularyEncounterContract

  /** Populated for CONVERSATION quests — thread persists in quest_snapshot + conversations table. */
  conversationEncounter?: ConversationEncounterContract

  /** Populated for SPEECH quests — phrase progress in quest_snapshot. */
  speechEncounter?: SpeechEncounterContract

  /** Populated for DUNGEON quests — run state + active encounter payloads. */
  dungeonRun?: DungeonRunContract

  /** Active listening sector (dungeon or future listening quests). */
  listeningEncounter?: ListeningEncounterContract

  /** First-run guided quest; lighter failure penalties. */
  isTutorial?: boolean

  /** Pre-quest vocabulary briefing (unknown / critical words). */
  vocabularyPreparation?: QuestVocabularyPreparationContract

  hidden?: boolean
}

export type QuestType =
  | "VOCABULARY"
  | "CONVERSATION"
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