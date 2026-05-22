import { RECORDING_STATES } from "./recordingStateTypes"
import {
  getRecordingSnapshot,
  returnToIdle,
} from "./recordingStateSystem"
import { releaseMicrophoneStream } from "./microphoneSystem"
import { logSpeechDebug } from "./speechDebugSystem"

const STALE_PROCESSING_MS = 45_000
const STALE_RECORDING_MS = 120_000

let recoveryInstalled = false
let staleCheckTimer: ReturnType<typeof setInterval> | null = null

export function forceSpeechRecovery(reason: string): void {
  logSpeechDebug({
    snapshot: getRecordingSnapshot(),
    extra: `recovery: ${reason}`,
  })
  releaseMicrophoneStream()
  returnToIdle()
}

export function installSpeechRecoveryHandlers(): void {
  if (recoveryInstalled || typeof window === "undefined") return
  recoveryInstalled = true

  const onVisibility = () => {
    if (document.visibilityState === "hidden") {
      const snap = getRecordingSnapshot()
      if (snap.state === RECORDING_STATES.RECORDING) {
        logSpeechDebug({
          snapshot: snap,
          extra: "tab hidden during recording",
        })
      }
    }
  }

  const onPageHide = () => {
    const snap = getRecordingSnapshot()
    if (
      snap.state === RECORDING_STATES.RECORDING ||
      snap.state === RECORDING_STATES.PROCESSING
    ) {
      forceSpeechRecovery("page hide")
    }
  }

  window.addEventListener("visibilitychange", onVisibility)
  window.addEventListener("pagehide", onPageHide)

  staleCheckTimer = setInterval(() => {
    const snap = getRecordingSnapshot()
    const now = Date.now()
    if (!snap.startedAtMs) return

    const elapsed = now - snap.startedAtMs
    if (
      snap.state === RECORDING_STATES.PROCESSING &&
      elapsed > STALE_PROCESSING_MS
    ) {
      forceSpeechRecovery("stale processing")
      return
    }
    if (
      snap.state === RECORDING_STATES.RECORDING &&
      elapsed > STALE_RECORDING_MS
    ) {
      forceSpeechRecovery("stale recording")
    }
  }, 5000)
}

export function uninstallSpeechRecoveryHandlers(): void {
  if (!recoveryInstalled || typeof window === "undefined") return
  recoveryInstalled = false
  if (staleCheckTimer) {
    clearInterval(staleCheckTimer)
    staleCheckTimer = null
  }
}
