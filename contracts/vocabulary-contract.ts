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
