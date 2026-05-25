import type {
  ConversationEncounterContract,
  ListeningEncounterContract,
  SpeechEncounterContract,
  VocabularyEncounterContract,
} from "./encounter-contract"
import type { DungeonRunContract } from "./dungeon-contract"
import type { GameModeId } from "./game-mode-contract"
import type { QuestVocabularyPreparationContract } from "./vocabulary-contract"

/** MAIN = story; SIDE = narrative contracts; DAILY = maintenance slot (UTC date id). */
export type QuestNarrativeTier = "MAIN" | "SIDE" | "DAILY"

/** Which contract board channel requested generation. */
export type QuestRequestChannel = "daily" | "side" | "story"

export interface QuestContract {
  id: string

  type: QuestType

  title: string
  description: string

  difficulty: QuestDifficulty

  narrativeTier?: QuestNarrativeTier

  rewards: QuestRewardContract

  penalties?: QuestPenaltyContract

  objectives: QuestObjectiveContract[]

  requirements?: QuestRequirementContract[]

  /** Populated for VOCABULARY quests — encounter state persists in quest_snapshot. */
  vocabularyEncounter?: VocabularyEncounterContract

  /** Terminal breach environmental reading mode */
  terminalBreachEncounter?: import("./encounter-contract").TerminalBreachEncounterContract

  /** Kanji surgery / memory cascade training payloads */
  kanjiSurgeryEncounter?: import("./encounter-contract").KanjiSurgeryTargetContract[]
  memoryCascadeEncounter?: import("./encounter-contract").MemoryCascadeRoundContract
  memoryGridEncounter?: import("./encounter-contract").MemoryGridRoundContract
  echoListeningEncounter?: import("./encounter-contract").EchoListeningRoundContract

  /** Semantic network vocabulary mode */
  semanticNetworkEncounter?: {
    nodes: import("./encounter-contract").SemanticNetworkNodeContract[]
    links: import("./encounter-contract").SemanticNetworkLinkContract[]
    matchedLinkIds: string[]
  }

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

  /** Distinct gameplay mode — defaults to STANDARD when absent. */
  gameMode?: GameModeId

  hidden?: boolean
}

export type QuestType =
  | "VOCABULARY"
  | "CONVERSATION"
  | "LISTENING"
  | "SPEECH"
  | "DUNGEON"
  | "RAID"

export type QuestDifficulty =
  | "EASY"
  | "NORMAL"
  | "HARD"
  | "ELITE"
  | "NIGHTMARE"

export interface QuestRewardItemContract {
  itemKey: string
  quantity: number
}

export interface QuestRewardContract {
  xp: number
  credits?: number
  items?: (string | QuestRewardItemContract)[]
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

  /** Hidden until currentProgress reaches revealAt */
  hidden?: boolean
  revealAt?: number
}

export interface QuestRequirementContract {
  minimumLevel?: number
  minimumRank?: string
  requiredDungeonClear?: string
}