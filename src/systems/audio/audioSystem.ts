const STORAGE_KEY = "nozomi_audio_muted"

export type AudioCueId =
  | "confirm"
  | "error"
  | "levelUp"
  | "encounterStart"
  | "sectorClear"
  | "questComplete"
  | "corruption"
  | "corruptionSting"
  | "combo2"
  | "combo5"
  | "comboBreak"
  | "rewardTick"
  | "achievement"
  | "rewardCascade"

export type AmbienceCue = "sector" | "pursuit" | "corruption" | "corridor"

let ctx: AudioContext | null = null
let muted = false
let corruptionLoop: OscillatorNode | null = null
let corruptionGain: GainNode | null = null
let ambienceLoop: OscillatorNode | null = null
let ambienceGain: GainNode | null = null
let activeAmbience: AmbienceCue | null = null

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
  if (value) {
    stopCorruptionHum()
    stopAmbience()
  }
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

export function playAudioCues(cues: AudioCueId[]): void {
  for (const cue of cues) {
    playAudioCue(cue)
  }
}

export function playAudioCue(cue: AudioCueId): void {
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
    case "corruptionSting":
      playCorruptionSting()
      break
    case "combo2":
      tone(523, 70)
      setTimeout(() => tone(659, 80), 60)
      break
    case "combo5":
      tone(587, 80)
      setTimeout(() => tone(740, 90), 70)
      setTimeout(() => tone(880, 100), 150)
      break
    case "comboBreak":
      tone(140, 120, "square", 0.035)
      break
    case "rewardTick":
      tone(494, 60, "triangle", 0.05)
      break
    case "achievement":
      tone(392, 90)
      setTimeout(() => tone(523, 100), 90)
      setTimeout(() => tone(659, 120), 180)
      break
    case "rewardCascade":
      tone(440, 50, "triangle", 0.04)
      setTimeout(() => tone(554, 55, "triangle", 0.04), 55)
      break
    default:
      break
  }
}

/** Short wrong-answer / penalty sting — not the persistent corruption hum. */
function playCorruptionSting(): void {
  if (muted) return
  const c = getContext()
  if (!c) return
  unlockAudio()

  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = "sawtooth"
  osc.frequency.setValueAtTime(92, c.currentTime)
  osc.frequency.exponentialRampToValueAtTime(48, c.currentTime + 0.22)
  g.gain.value = 0.028
  osc.connect(g)
  g.connect(c.destination)
  const t = c.currentTime
  g.gain.setValueAtTime(0.028, t)
  g.gain.exponentialRampToValueAtTime(0.001, t + 0.28)
  osc.start(t)
  osc.stop(t + 0.3)
}

export function startCorruptionHum(): void {
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

const AMBIENCE_PROFILE: Record<
  AmbienceCue,
  { frequency: number; type: OscillatorType; gain: number }
> = {
  sector: { frequency: 88, type: "triangle", gain: 0.008 },
  pursuit: { frequency: 64, type: "sawtooth", gain: 0.01 },
  corruption: { frequency: 48, type: "sawtooth", gain: 0.012 },
  corridor: { frequency: 72, type: "sine", gain: 0.006 },
}

export function playAmbience(cue: AmbienceCue): void {
  if (muted) return
  if (activeAmbience === cue && ambienceLoop) return
  stopAmbience()

  const c = getContext()
  if (!c) return
  unlockAudio()

  const profile = AMBIENCE_PROFILE[cue]
  const osc = c.createOscillator()
  const g = c.createGain()
  osc.type = profile.type
  osc.frequency.value = profile.frequency
  g.gain.value = profile.gain
  osc.connect(g)
  g.connect(c.destination)
  osc.start()
  ambienceLoop = osc
  ambienceGain = g
  activeAmbience = cue
}

export function stopAmbience(): void {
  if (!ambienceLoop || !ambienceGain) {
    activeAmbience = null
    return
  }
  try {
    ambienceLoop.stop()
  } catch {
    /* already stopped */
  }
  ambienceLoop.disconnect()
  ambienceGain.disconnect()
  ambienceLoop = null
  ambienceGain = null
  activeAmbience = null
}

/** Stop looping dungeon / corruption audio (e.g. on extract, fail, abandon). */
export function stopRunAudio(): void {
  stopCorruptionHum()
  stopAmbience()
}
