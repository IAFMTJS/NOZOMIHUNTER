const STORAGE_KEY = "nozomi_audio_muted"

type AudioCue =
  | "confirm"
  | "error"
  | "levelUp"
  | "encounterStart"
  | "sectorClear"
  | "questComplete"
  | "corruption"

let ctx: AudioContext | null = null
let muted = false
let corruptionLoop: OscillatorNode | null = null
let corruptionGain: GainNode | null = null

function readMuted(): boolean {
  if (typeof window === "undefined") return false
  try {
    return localStorage.getItem(STORAGE_KEY) === "1"
  } catch {
    return false
  }
}

muted = readMuted()

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null
  if (!ctx) {
    const Ctx =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext
    if (!Ctx) return null
    ctx = new Ctx()
  }
  return ctx
}

export function unlockAudio(): void {
  const c = getContext()
  if (c?.state === "suspended") void c.resume()
}

export function isAudioMuted(): boolean {
  return muted
}

export function setAudioMuted(value: boolean): void {
  muted = value
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, value ? "1" : "0")
    } catch {
      /* ignore */
    }
  }
  if (value) stopCorruptionHum()
}

function tone(
  frequency: number,
  durationMs: number,
  type: OscillatorType = "sine",
  gain = 0.06
): void {
  if (muted) return
  const c = getContext()
  if (!c) return
  unlockAudio()

  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = type
  osc.frequency.value = frequency
  g.gain.value = gain
  osc.connect(g)
  g.connect(c.destination)
  const t = c.currentTime
  g.gain.setValueAtTime(gain, t)
  g.gain.exponentialRampToValueAtTime(0.001, t + durationMs / 1000)
  osc.start(t)
  osc.stop(t + durationMs / 1000)
}

export function playAudioCue(cue: AudioCue): void {
  if (muted) return
  switch (cue) {
    case "confirm":
      tone(440, 80)
      break
    case "error":
      tone(180, 140, "square", 0.04)
      break
    case "levelUp":
      tone(330, 100)
      setTimeout(() => tone(440, 120), 90)
      setTimeout(() => tone(554, 160), 200)
      break
    case "encounterStart":
      tone(220, 120, "triangle", 0.05)
      break
    case "sectorClear":
      tone(392, 90)
      setTimeout(() => tone(523, 110), 80)
      break
    case "questComplete":
      tone(294, 100)
      setTimeout(() => tone(370, 130), 100)
      break
    case "corruption":
      startCorruptionHum()
      break
    default:
      break
  }
}

function startCorruptionHum(): void {
  if (muted || corruptionLoop) return
  const c = getContext()
  if (!c) return
  unlockAudio()
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = "sawtooth"
  osc.frequency.value = 52
  g.gain.value = 0.012
  osc.connect(g)
  g.connect(c.destination)
  osc.start()
  corruptionLoop = osc
  corruptionGain = g
}

export function stopCorruptionHum(): void {
  if (!corruptionLoop || !corruptionGain) return
  try {
    corruptionLoop.stop()
  } catch {
    /* already stopped */
  }
  corruptionLoop.disconnect()
  corruptionGain.disconnect()
  corruptionLoop = null
  corruptionGain = null
}
