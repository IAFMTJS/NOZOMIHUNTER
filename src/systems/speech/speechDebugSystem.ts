import type { RecordingStateSnapshot } from "./recordingStateTypes"

let debugEnabled =
  typeof process !== "undefined" &&
  process.env.NEXT_PUBLIC_SPEECH_DEBUG === "true"

export function setSpeechDebugEnabled(enabled: boolean): void {
  debugEnabled = enabled
}

export function isSpeechDebugEnabled(): boolean {
  return debugEnabled
}

export interface SpeechDebugLineInput {
  micActive?: boolean
  snapshot: RecordingStateSnapshot
  recorderState?: string
  extra?: string
}

export function formatSpeechDebugLine(input: SpeechDebugLineInput): string {
  const { snapshot, micActive, recorderState, extra } = input
  const parts = [
    micActive || snapshot.micActive ? "MIC ACTIVE" : "MIC OFF",
    `STATE: ${snapshot.state}`,
    `UPLOAD: ${snapshot.uploadStatus.toUpperCase()}`,
    `STT: ${snapshot.transcriptionStatus.toUpperCase()}`,
  ]
  if (recorderState) parts.push(`RECORDER: ${recorderState}`)
  if (snapshot.retryCount > 0) parts.push(`RETRY: ${snapshot.retryCount}`)
  if (extra) parts.push(extra)
  return parts.join(" | ")
}

export function logSpeechDebug(input: SpeechDebugLineInput): void {
  if (!debugEnabled) return
  console.info("[speech]", formatSpeechDebugLine(input))
}
