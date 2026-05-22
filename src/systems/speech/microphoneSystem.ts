import {
  canAccessMicrophone,
  getMicrophoneAccessIssue,
} from "./speechContextSystem"
import {
  getRecordingSnapshot,
  patchRecordingState,
} from "./recordingStateSystem"
import { logSpeechDebug } from "./speechDebugSystem"

export type MicrophonePermissionStatus =
  | "idle"
  | "requesting"
  | "ready"
  | "denied"
  | "unavailable"

let activeStream: MediaStream | null = null
let levelMonitorDispose: (() => void) | null = null

export function getActiveMicrophoneStream(): MediaStream | null {
  return activeStream?.active ? activeStream : null
}

export function isMicrophoneActive(): boolean {
  return !!activeStream?.active
}

function attachTrackEndedHandlers(stream: MediaStream): void {
  for (const track of stream.getTracks()) {
    track.onended = () => {
      if (activeStream === stream) {
        releaseMicrophoneStream()
      }
    }
  }
}

const AUDIO_CONSTRAINTS: MediaTrackConstraints = {
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
}

function micUnavailableError(): {
  ok: false
  status: MicrophonePermissionStatus
  error: string
} {
  const issue = getMicrophoneAccessIssue()
  if (issue === "insecure-local-network") {
    return {
      ok: false,
      status: "unavailable",
      error:
        "LAN HTTP cannot access the microphone on mobile. Use npm run dev:mobile (HTTPS) instead.",
    }
  }
  return {
    ok: false,
    status: "unavailable",
    error: "Voice requires HTTPS (or localhost).",
  }
}

function adoptMicrophoneStream(stream: MediaStream): {
  ok: true
  status: MicrophonePermissionStatus
} {
  activeStream = stream
  attachTrackEndedHandlers(stream)
  patchRecordingState({ micActive: true })
  logSpeechDebug({
    snapshot: getRecordingSnapshot(),
    micActive: true,
    extra: "stream acquired",
  })
  return { ok: true, status: "ready" }
}

function mapGetUserMediaError(e: unknown): {
  ok: false
  status: MicrophonePermissionStatus
  error: string
} {
  const name = e instanceof DOMException ? e.name : ""
  if (name === "NotAllowedError" || name === "PermissionDeniedError") {
    return {
      ok: false,
      status: "denied",
      error: "Microphone permission denied — allow mic in browser settings, then try again.",
    }
  }
  if (name === "NotFoundError" || name === "DevicesNotFoundError") {
    return {
      ok: false,
      status: "unavailable",
      error: "No microphone found on this device.",
    }
  }
  return {
    ok: false,
    status: "unavailable",
    error: e instanceof Error ? e.message : "Microphone unavailable",
  }
}

/**
 * Call synchronously from a tap/click handler (iOS requires this for the permission prompt).
 * Pass the returned promise into {@link resolveMicrophoneRequest} / {@link startSpeechRecording}.
 */
export function beginMicrophoneRequest(): Promise<MediaStream> | null {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
    return null
  }
  if (!canAccessMicrophone()) {
    return null
  }
  if (activeStream?.active) {
    return Promise.resolve(activeStream)
  }
  return navigator.mediaDevices.getUserMedia({ audio: AUDIO_CONSTRAINTS })
}

export async function resolveMicrophoneRequest(
  request: Promise<MediaStream>
): Promise<{
  ok: boolean
  status: MicrophonePermissionStatus
  error?: string
}> {
  if (activeStream?.active) {
    patchRecordingState({ micActive: true })
    return { ok: true, status: "ready" }
  }

  try {
    const stream = await request
    return adoptMicrophoneStream(stream)
  } catch (e) {
    return mapGetUserMediaError(e)
  }
}

export async function requestMicrophoneAccess(): Promise<{
  ok: boolean
  status: MicrophonePermissionStatus
  error?: string
}> {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
    return {
      ok: false,
      status: "unavailable",
      error: "Microphone API unavailable",
    }
  }

  if (!canAccessMicrophone()) {
    return micUnavailableError()
  }

  if (activeStream?.active) {
    patchRecordingState({ micActive: true })
    return { ok: true, status: "ready" }
  }

  const request = beginMicrophoneRequest()
  if (!request) {
    return micUnavailableError()
  }
  return resolveMicrophoneRequest(request)
}

export function releaseMicrophoneStream(): void {
  stopMicLevelMonitor()
  if (!activeStream) {
    patchRecordingState({ micActive: false })
    return
  }
  activeStream.getTracks().forEach((track) => track.stop())
  activeStream = null
  patchRecordingState({ micActive: false })
  logSpeechDebug({
    snapshot: getRecordingSnapshot(),
    extra: "stream released",
  })
}

export function createMicLevelMonitor(onLevel: (level: number) => void): () => void {
  stopMicLevelMonitor()
  const stream = getActiveMicrophoneStream()
  if (!stream) return () => undefined

  const ctx = new AudioContext()
  if (ctx.state === "suspended") {
    void ctx.resume().catch(() => undefined)
  }

  const source = ctx.createMediaStreamSource(stream)
  const analyser = ctx.createAnalyser()
  analyser.fftSize = 256
  source.connect(analyser)

  const data = new Uint8Array(analyser.frequencyBinCount)
  let frame = 0
  let running = true

  const tick = () => {
    if (!running) return
    analyser.getByteFrequencyData(data)
    let sum = 0
    for (let i = 0; i < data.length; i++) sum += data[i]
    const avg = sum / data.length / 255
    onLevel(avg)
    frame = requestAnimationFrame(tick)
  }

  tick()

  const dispose = () => {
    if (!running) return
    running = false
    cancelAnimationFrame(frame)
    source.disconnect()
    analyser.disconnect()
    if (ctx.state !== "closed") {
      void ctx.close().catch(() => undefined)
    }
  }

  levelMonitorDispose = dispose
  return dispose
}

export function stopMicLevelMonitor(): void {
  levelMonitorDispose?.()
  levelMonitorDispose = null
}
