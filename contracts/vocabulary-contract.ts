/** Normalized vocabulary entry (JMDict ingest or curated catalog). */
export interface VocabularyEntryContract {
  id: string
  entSeq: number
  japanese: string[]
  reading: string[]
  meanings: string[]
  romaji: string
  jlpt?: string
  frequencyTier: number
}

export interface WordMasteryContract {
  wordId: string
  mastery: number
  correctCount: number
  wrongCount: number
  lastSeenAt: string
}

export type VocabularyThreatLevel =
  | "ROUTINE"
  | "ELEVATED"
  | "CRITICAL"
  | "SECTOR_CRITICAL"

/** Learner-facing word explanation shown before a quest encounter. */
export interface VocabularyExplanationContract {
  kanji: string
  /** Kana reading when known (prep tiles + learner display). */
  reading?: string
  romaji: string
  meaning: string
  context: string
  importance: "LOW" | "MEDIUM" | "HIGH"
  threatLevel: VocabularyThreatLevel
}

/** Mission briefing generated from unknown / critical vocabulary. */
export interface QuestVocabularyPreparationContract {
  questId: string
  preparationScore: number
  newVocabulary: VocabularyExplanationContract[]
  briefingDismissed: boolean
}
