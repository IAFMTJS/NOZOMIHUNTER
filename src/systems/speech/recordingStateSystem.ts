import {
  INITIAL_RECORDING_SNAPSHOT,
  RECORDING_STATES,
  type RecordingState,
  type RecordingStateSnapshot,
  type UploadStatus,
  type TranscriptionStatus,
} from "./recordingStateTypes"
import { logSpeechDebug } from "./speechDebugSystem"

type Listener = (snapshot: RecordingStateSnapshot) => void

let snapshot: RecordingStateSnapshot = { ...INITIAL_RECORDING_SNAPSHOT }
const listeners = new Set<Listener>()

const ALLOWED: Record<RecordingState, RecordingState[]> = {
  [RECORDING_STATES.IDLE]: [
    RECORDING_STATES.REQUESTING_PERMISSION,
    RECORDING_STATES.ERROR,
  ],
  [RECORDING_STATES.REQUESTING_PERMISSION]: [
    RECORDING_STATES.RECORDING,
    RECORDING_STATES.IDLE,
    RECORDING_STATES.ERROR,
  ],
  [RECORDING_STATES.RECORDING]: [
    RECORDING_STATES.PROCESSING,
    RECORDING_STATES.IDLE,
    RECORDING_STATES.ERROR,
  ],
  [RECORDING_STATES.PROCESSING]: [
    RECORDING_STATES.COMPLETED,
    RECORDING_STATES.RECORDING,
    RECORDING_STATES.IDLE,
    RECORDING_STATES.ERROR,
  ],
  [RECORDING_STATES.COMPLETED]: [
    RECORDING_STATES.IDLE,
    RECORDING_STATES.REQUESTING_PERMISSION,
  ],
  [RECORDING_STATES.ERROR]: [
    RECORDING_STATES.IDLE,
    RECORDING_STATES.REQUESTING_PERMISSION,
  ],
}

function notify(): void {
  const copy = { ...snapshot }
  for (const listener of listeners) {
    listener(copy)
  }
  logSpeechDebug({ snapshot: copy, micActive: copy.micActive })
}

function canTransition(next: RecordingState): boolean {
  return ALLOWED[snapshot.state].includes(next)
}

export function getRecordingSnapshot(): RecordingStateSnapshot {
  return { ...snapshot }
}

export function subscribeRecordingState(listener: Listener): () => void {
  listeners.add(listener)
  listener({ ...snapshot })
  return () => listeners.delete(listener)
}

export function transitionRecordingState(
  next: RecordingState,
  patch: Partial<Omit<RecordingStateSnapshot, "state">> = {},
  options?: { force?: boolean }
): boolean {
  if (!options?.force && !canTransition(next)) {
    logSpeechDebug({
      snapshot,
      extra: `blocked transition ${snapshot.state} -> ${next}`,
    })
    return false
  }

  snapshot = {
    ...snapshot,
    ...patch,
    state: next,
  }
  notify()
  return true
}

export function patchRecordingState(
  patch: Partial<RecordingStateSnapshot>
): void {
  snapshot = { ...snapshot, ...patch }
  notify()
}

export function resetRecordingState(): void {
  snapshot = { ...INITIAL_RECORDING_SNAPSHOT }
  notify()
}

export function setUploadStatus(status: UploadStatus): void {
  patchRecordingState({ uploadStatus: status })
}

export function setTranscriptionStatus(status: TranscriptionStatus): void {
  patchRecordingState({ transcriptionStatus: status })
}

export function beginRecordingSession(sessionId: string): void {
  transitionRecordingState(RECORDING_STATES.REQUESTING_PERMISSION, {
    sessionId,
    error: null,
    uploadStatus: "idle",
    transcriptionStatus: "idle",
    retryCount: 0,
    startedAtMs: Date.now(),
    micActive: false,
  })
}

export function markRecordingActive(): void {
  transitionRecordingState(RECORDING_STATES.RECORDING, { micActive: true })
}

export function markProcessing(): void {
  transitionRecordingState(RECORDING_STATES.PROCESSING, { micActive: false })
}

export function markCompleted(): void {
  transitionRecordingState(RECORDING_STATES.COMPLETED, {
    uploadStatus: snapshot.uploadStatus === "uploading" ? "success" : snapshot.uploadStatus,
  })
}

export function markRecordingError(message: string): void {
  transitionRecordingState(
    RECORDING_STATES.ERROR,
    { error: message, micActive: false },
    { force: true }
  )
}

export function returnToIdle(): void {
  transitionRecordingState(RECORDING_STATES.IDLE, {
    sessionId: null,
    error: null,
    uploadStatus: "idle",
    transcriptionStatus: "idle",
    retryCount: 0,
    micActive: false,
    startedAtMs: null,
  }, { force: true })
}
