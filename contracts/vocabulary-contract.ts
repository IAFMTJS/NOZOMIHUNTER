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

/** Learner-facing word explanation shown before a quest encounter. */
export interface VocabularyExplanationContract {
  kanji: string
  romaji: string
  meaning: string
  context: string
  importance: "LOW" | "MEDIUM" | "HIGH"
}

/** Mission briefing generated from unknown / critical vocabulary. */
export interface QuestVocabularyPreparationContract {
  questId: string
  preparationScore: number
  newVocabulary: VocabularyExplanationContract[]
  briefingDismissed: boolean
}
