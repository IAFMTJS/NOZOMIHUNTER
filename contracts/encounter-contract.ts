export type ChallengePromptDirection =
  | "RETRIEVE_ENGLISH"
  | "RETRIEVE_JAPANESE"
  | "RETRIEVE_READING"
  | "LISTEN_DECODE"
  | "SPEAK_JAPANESE"
  | "SPEAK_FROM_PROMPT"

export type ChallengeDisplayPhase = "ACTIVE" | "REVEALED"

export type AnswerInputMode = "english" | "romaji" | "kana" | "japanese"

export interface ChallengeWordFields {
  promptDirection?: ChallengePromptDirection
  inputMode?: AnswerInputMode
}

export interface VocabularyWordContract extends ChallengeWordFields {
  id: string
  japanese: string
  /** Primary kana reading (reb). */
  reading: string
  romaji: string
  meanings: string[]
}

export interface VocabularyEncounterContract {
  words: VocabularyWordContract[]
  currentIndex: number
  wrongAttempts: number
  /** Consecutive correct answers in this encounter. */
  correctStreak?: number
}

export type ConversationRole = "director" | "player"

export interface ConversationMessageContract {
  id: string
  role: ConversationRole
  content: string
  /** Romaji for Japanese in content (learner aid). */
  reading?: string
  timestamp: string
}

export interface ConversationEncounterContract {
  scenarioId: string
  directorName: string
  briefing: string
  requiredExchanges: number
  messages: ConversationMessageContract[]
  successfulExchanges: number
  wrongTurns: number
  /** Ghost interrogation / deep cover mode */
  branchId?: string
  clueState?: string[]
  branchChoices?: ConversationBranchChoiceContract[]
  panicMode?: boolean
  panicSecondsRemaining?: number
  relationshipTrust?: number
}

export interface SpeechPhraseContract extends ChallengeWordFields {
  id: string
  japanese: string
  reading: string
  romaji: string
  meanings: string[]
}

export interface SpeechAttemptContract {
  transcript: string
  compositeScore: number
  passed: boolean
  responseTimeMs: number
  timestamp: string
}

export interface SpeechEncounterContract {
  scenarioId: string
  briefing: string
  phrases: SpeechPhraseContract[]
  currentIndex: number
  wrongAttempts: number
  attempts: SpeechAttemptContract[]
}

/**
 * Listening via browser TTS. UI requires `heardOnce` before submit.
 * Correct decode updates `word_mastery` via `recordWordAnswer`.
 * Skip tokens cannot fast-forward listening objectives.
 */
export interface ListeningFragmentContract extends ChallengeWordFields {
  id: string
  japanese: string
  reading: string
  romaji: string
  meanings: string[]
}

export interface ListeningEncounterContract {
  briefing: string
  fragments: ListeningFragmentContract[]
  currentIndex: number
  wrongAttempts: number
  correctStreak?: number
  revealFragmentId?: string | null
  replayCount?: number
  /** Signal calibration / lost transmission mode state */
  replayBudget?: number
  channelIsolated?: boolean
  timelineKeywords?: string[]
  taggedKeywords?: string[]
}

export interface TerminalSignContract {
  id: string
  label: string
  japanese: string
  reading: string
  romaji: string
  meanings: string[]
  isTrap?: boolean
}

export interface TerminalBreachEncounterContract {
  sectorId: string
  signs: TerminalSignContract[]
  terminals: TerminalSignContract[]
  currentStep: number
  alarmsTriggered: number
  pathUnlocked: boolean
}

export interface ConversationBranchChoiceContract {
  id: string
  label: string
  implication: string
}

export interface KanjiSurgeryTargetContract {
  id: string
  japanese: string
  reading: string
  romaji: string
  radicals: string[]
  stability: number
}

export interface MemoryCascadeRoundContract {
  words: VocabularyWordContract[]
  intruderId: string | null
  revealed: boolean
}

export interface SemanticNetworkNodeContract {
  id: string
  label: string
  japanese?: string
  reading?: string
  group: "meaning" | "kanji" | "context"
}

export interface SemanticNetworkLinkContract {
  fromId: string
  toId: string
}
