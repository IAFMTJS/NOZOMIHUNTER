import { isRecordingSupported } from "./audioFormatSystem"
import {
  canAccessMicrophone,
  getMicrophoneAccessHint,
  getMicrophoneAccessIssue,
} from "./speechContextSystem"
import { FEATURE_FLAGS } from "@/config/features"
import { resolveClientTranscript } from "./clientTranscriptionSystem"
import {
  beginRecordingSession,
  getRecordingSnapshot,
  markCompleted,
  markProcessing,
  markRecordingActive,
  markRecordingError,
  returnToIdle,
} from "./recordingStateSystem"
import { RECORDING_STATES } from "./recordingStateTypes"
import {
  createMicLevelMonitor,
  releaseMicrophoneStream,
  requestMicrophoneAccess,
  resolveMicrophoneRequest,
  stopMicLevelMonitor,
} from "./microphoneSystem"
import {
  createSilenceDetector,
  type SilenceDetector,
} from "./silenceDetectionSystem"
import {
  type SpeechRecognitionLang,
  isBrowserSpeechRecognitionSupported,
} from "./browserSpeechRecognitionSystem"
import { forceSpeechRecovery } from "./speechRecoverySystem"
import {
  finalizeMediaRecorderBlob,
  resetRecordedChunks,
  startMediaRecorderCapture,
  stopMediaRecorderCapture,
} from "./speechMediaRecorder"
import {
  abortSpeechLiveRecognition,
  clearLiveTranscript,
  getLiveTranscript,
  setLiveTranscript,
  startSpeechLiveRecognition,
  stopSpeechLiveRecognition,
} from "./speechLiveRecognition"

let activeSessionId: string | null = null
let silenceDetector: SilenceDetector | null = null
let onLevelCallback: ((level: number) => void) | null = null
let onTranscriptCallback: ((text: string) => void) | null = null
let responseStartedAt = 0

export function setSpeechTranscriptCallback(
  cb: ((text: string) => void) | null
): void {
  onTranscriptCallback = cb
}

function newSessionId(): string {
  return `speech-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
}

function isBusy(): boolean {
  const state = getRecordingSnapshot().state
  return (
    state === RECORDING_STATES.REQUESTING_PERMISSION ||
    state === RECORDING_STATES.RECORDING ||
    state === RECORDING_STATES.PROCESSING
  )
}

export function setSpeechLevelCallback(cb: ((level: number) => void) | null): void {
  onLevelCallback = cb
}

export function getSpeechResponseTimeMs(): number {
  if (!responseStartedAt) return 0
  return Math.max(0, Date.now() - responseStartedAt)
}

export async function startSpeechRecording(
  lang: SpeechRecognitionLang = "en-US",
  preflightMic?: Promise<MediaStream> | null
): Promise<{ ok: boolean; error?: string }> {
  if (isBusy()) {
    return { ok: false, error: "Recording already in progress" }
  }

  if (!canAccessMicrophone()) {
    const msg =
      getMicrophoneAccessHint(getMicrophoneAccessIssue()) ||
      "Microphone unavailable in this context."
    markRecordingError(msg)
    return { ok: false, error: msg }
  }

  if (!FEATURE_FLAGS.SPEECH_RECORDING) {
    markRecordingError("Speech recording is disabled")
    return { ok: false, error: "Speech recording is disabled" }
  }

  const sessionId = newSessionId()
  activeSessionId = sessionId
  resetRecordedChunks()
  clearLiveTranscript()
  responseStartedAt = Date.now()

  beginRecordingSession(sessionId)

  const mic = preflightMic
    ? await resolveMicrophoneRequest(preflightMic)
    : await requestMicrophoneAccess()
  if (!mic.ok) {
    const msg = mic.error ?? "Microphone not available"
    markRecordingError(msg)
    activeSessionId = null
    return { ok: false, error: msg }
  }

  stopMicLevelMonitor()
  silenceDetector?.dispose()
  silenceDetector = createSilenceDetector(undefined, () => {
    void stopSpeechRecording()
  })

  createMicLevelMonitor((level) => {
    onLevelCallback?.(level)
    silenceDetector?.feedLevel(level)
  })

  if (FEATURE_FLAGS.SPEECH_RECORDING && isRecordingSupported()) {
    const recorder = startMediaRecorderCapture()
    if (!recorder.ok) {
      releaseMicrophoneStream()
      activeSessionId = null
      return { ok: false, error: recorder.error }
    }
  }

  startSpeechLiveRecognition(lang, (text) => {
    setLiveTranscript(text)
    onTranscriptCallback?.(text)
  })

  markRecordingActive()
  return { ok: true }
}

export async function stopSpeechRecording(): Promise<{
  ok: boolean
  transcript: string
  responseTimeMs: number
  error?: string
}> {
  const sessionId = activeSessionId
  const snap = getRecordingSnapshot()

  if (!sessionId || snap.state !== RECORDING_STATES.RECORDING) {
    return {
      ok: false,
      transcript: "",
      responseTimeMs: getSpeechResponseTimeMs(),
      error: "No active recording",
    }
  }

  markProcessing()
  stopMicLevelMonitor()
  silenceDetector?.dispose()
  silenceDetector = null

  const recognitionText = await stopSpeechLiveRecognition()
  const blob = await finalizeMediaRecorderBlob()

  const clientTranscript = (recognitionText || getLiveTranscript()).trim()
  const resolved = await resolveClientTranscript({
    blob,
    sessionId,
    clientTranscript,
  })

  if (!resolved.ok) {
    const msg = resolved.error ?? "Transcription failed"
    markRecordingError(msg)
    releaseMicrophoneStream()
    activeSessionId = null
    returnToIdle()
    return {
      ok: false,
      transcript: "",
      responseTimeMs: getSpeechResponseTimeMs(),
      error: msg,
    }
  }

  const transcript = resolved.transcript

  releaseMicrophoneStream()
  markCompleted()
  onTranscriptCallback?.(transcript)
  activeSessionId = null
  clearLiveTranscript()
  returnToIdle()

  const responseTimeMs = getSpeechResponseTimeMs()
  return { ok: true, transcript, responseTimeMs }
}

export function cancelSpeechRecording(): void {
  abortSpeechLiveRecognition()
  stopMediaRecorderCapture()
  clearLiveTranscript()
  activeSessionId = null
  silenceDetector?.dispose()
  silenceDetector = null
  stopMicLevelMonitor()
  forceSpeechRecovery("cancelled")
}

export function resetSpeechSession(): void {
  cancelSpeechRecording()
  returnToIdle()
}

export function isSpeechRecordingSupported(): boolean {
  return (
    canAccessMicrophone() &&
    (isRecordingSupported() || isBrowserSpeechRecognitionSupported())
  )
}
