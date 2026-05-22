export type WordMastery =
  | "UNKNOWN"
  | "SEEN"
  | "RECOGNIZED"
  | "UNDERSTOOD"
  | "CONFIDENT"
  | "MASTERED"

export interface VocabularyProgress {
  word: string
  mastery: WordMastery
  exposureCount: number
  successCount: number
  hesitationCount: number
}

export function updateWordMastery(
  progress: VocabularyProgress
): WordMastery {

  if (progress.successCount >= 25) {
    return "MASTERED"
  }

  if (progress.successCount >= 15) {
    return "CONFIDENT"
  }

  if (progress.successCount >= 8) {
    return "UNDERSTOOD"
  }

  if (progress.successCount >= 3) {
    return "RECOGNIZED"
  }

  return "SEEN"
}