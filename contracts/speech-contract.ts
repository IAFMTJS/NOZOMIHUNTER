export const RECORDING_STATE_VALUES = [
  "IDLE",
  "REQUESTING_PERMISSION",
  "RECORDING",
  "PROCESSING",
  "COMPLETED",
  "ERROR",
] as const

export type RecordingStateContract =
  (typeof RECORDING_STATE_VALUES)[number]

export type SpeechUploadStatusContract =
  | "idle"
  | "pending"
  | "uploading"
  | "success"
  | "failed"
  | "retrying"

export type SpeechTranscriptionStatusContract =
  | "idle"
  | "processing"
  | "success"
  | "failed"
  | "skipped"

export interface SpeechRecordingStatusContract {
  state: RecordingStateContract
  error: string | null
  uploadStatus: SpeechUploadStatusContract
  transcriptionStatus: SpeechTranscriptionStatusContract
  retryCount: number
  micActive: boolean
}

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