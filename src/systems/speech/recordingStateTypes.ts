export const RECORDING_STATES = {
  IDLE: "IDLE",
  REQUESTING_PERMISSION: "REQUESTING_PERMISSION",
  RECORDING: "RECORDING",
  PROCESSING: "PROCESSING",
  COMPLETED: "COMPLETED",
  ERROR: "ERROR",
} as const

export type RecordingState =
  (typeof RECORDING_STATES)[keyof typeof RECORDING_STATES]

export type UploadStatus = "idle" | "pending" | "uploading" | "success" | "failed" | "retrying"

export type TranscriptionStatus =
  | "idle"
  | "processing"
  | "success"
  | "failed"
  | "skipped"

export interface RecordingStateSnapshot {
  state: RecordingState
  error: string | null
  uploadStatus: UploadStatus
  transcriptionStatus: TranscriptionStatus
  retryCount: number
  sessionId: string | null
  micActive: boolean
  startedAtMs: number | null
}

export const INITIAL_RECORDING_SNAPSHOT: RecordingStateSnapshot = {
  state: RECORDING_STATES.IDLE,
  error: null,
  uploadStatus: "idle",
  transcriptionStatus: "idle",
  retryCount: 0,
  sessionId: null,
  micActive: false,
  startedAtMs: null,
}
