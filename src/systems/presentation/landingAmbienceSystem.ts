/** Presentation-only landing atmosphere (whispers, time-of-day label). */

const WHISPERS_JP = [
  "聞こえるか…",
  "記憶はまだ眠っている",
  "扉は開いていない",
  "静寂が深い",
  "言葉が脈打つ",
] as const

export function pickLandingWhisper(seed = Date.now()): string {
  const idx = Math.floor(seed / 8000) % WHISPERS_JP.length
  return WHISPERS_JP[idx]!
}

export function landingTimeOfDayLabel(date = new Date()): string {
  const h = date.getHours()
  if (h >= 5 && h < 12) return "morning drift"
  if (h >= 12 && h < 18) return "amber static"
  if (h >= 18 && h < 22) return "neon dusk"
  return "deep night"
}
