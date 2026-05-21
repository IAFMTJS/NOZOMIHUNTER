export interface SpeechAnalysisContract {
  transcript: string

  pronunciationScore: number

  confidenceScore: number

  hesitationScore: number

  timingScore: number

  compositeScore: number

  passed: boolean

  responseTimeMs: number

  detectedWords: string[]

  mistakes: SpeechMistakeContract[]

  feedback: string
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