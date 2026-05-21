export interface SpeechAnalysisContract {
  transcript: string

  pronunciationScore: number

  confidenceScore: number

  hesitationScore: number

  detectedWords: string[]

  mistakes: SpeechMistakeContract[]
}

export interface SpeechMistakeContract {
  word: string

  issue: SpeechIssueType

  severity: number
}

export type SpeechIssueType =
  | "PRONUNCIATION"
  | "TIMING"
  | "MISSING_WORD"
  | "CONFIDENCE"