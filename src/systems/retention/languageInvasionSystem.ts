export interface LanguageInvasionContract {
  id: string
  headline: string
  detail: string
  /** Day-of-month window start (1–31) */
  windowStart: number
  /** Day-of-month window end */
  windowEnd: number
  corruptionDrift?: number
}

export const LANGUAGE_INVASION_SCHEDULE: LanguageInvasionContract[] = [
  {
    id: "invasion-kanji-bloom",
    headline: "Kanji bloom detected",
    detail: "Hostile glyph clusters appearing in routine sectors.",
    windowStart: 1,
    windowEnd: 7,
    corruptionDrift: 2,
  },
  {
    id: "invasion-grammar-fracture",
    headline: "Grammar fracture wave",
    detail: "Sentence particles mutating across contract channels.",
    windowStart: 14,
    windowEnd: 21,
    corruptionDrift: 3,
  },
  {
    id: "invasion-audio-ghost",
    headline: "Audio ghost invasion",
    detail: "Listening sectors carry phantom vocabulary overlays.",
    windowStart: 24,
    windowEnd: 28,
    corruptionDrift: 1,
  },
]

export function getActiveLanguageInvasion(
  seed?: string
): LanguageInvasionContract | null {
  const day = new Date().getDate()
  const active = LANGUAGE_INVASION_SCHEDULE.find(
    (i) => day >= i.windowStart && day <= i.windowEnd
  )
  if (active) return active
  if (!seed) return null
  let h = 0
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0
  }
  return LANGUAGE_INVASION_SCHEDULE[h % LANGUAGE_INVASION_SCHEDULE.length] ?? null
}

export function invasionCorruptionDrift(
  invasion: LanguageInvasionContract | null
): number {
  return invasion?.corruptionDrift ?? 0
}
