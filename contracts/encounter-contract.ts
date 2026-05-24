export interface VocabularyWordContract {
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
}

export interface SpeechPhraseContract {
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
export interface ListeningFragmentContract {
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
}
