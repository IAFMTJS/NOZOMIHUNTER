export type MicrophoneStatus =
  | "idle"
  | "requesting"
  | "ready"
  | "denied"
  | "unavailable"

let sharedStream: MediaStream | null = null

export async function ensureMicrophoneAccess(): Promise<{
  ok: boolean
  status: MicrophoneStatus
  error?: string
}> {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
    return { ok: false, status: "unavailable", error: "Microphone API unavailable" }
  }

  try {
    if (sharedStream?.active) {
      return { ok: true, status: "ready" }
    }

    sharedStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
      },
    })
    return { ok: true, status: "ready" }
  } catch (e) {
    const name = e instanceof DOMException ? e.name : ""
    if (name === "NotAllowedError" || name === "PermissionDeniedError") {
      return { ok: false, status: "denied", error: "Microphone permission denied" }
    }
    return {
      ok: false,
      status: "unavailable",
      error: e instanceof Error ? e.message : "Microphone unavailable",
    }
  }
}

export function releaseMicrophone(): void {
  if (!sharedStream) return
  for (const track of sharedStream.getTracks()) {
    track.stop()
  }
  sharedStream = null
}

export function createMicLevelMonitor(
  onLevel: (level: number) => void
): () => void {
  if (!sharedStream?.active) return () => undefined

  const ctx = new AudioContext()
  const source = ctx.createMediaStreamSource(sharedStream)
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

  let disposed = false
  return () => {
    if (disposed) return
    disposed = true
    running = false
    cancelAnimationFrame(frame)
    source.disconnect()
    analyser.disconnect()
    if (ctx.state !== "closed") {
      void ctx.close().catch(() => undefined)
    }
  }
}
