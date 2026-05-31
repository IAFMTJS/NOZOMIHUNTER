import { FEATURE_FLAGS } from "@/config/features"

export interface SectorEventDefinition {
  id: string
  title: string
  description: string
  /** ISO week number 1–53 when event is active */
  weekOfYear: number
  bonusXpPercent?: number
  vocabularyTag?: string
}

export const SECTOR_EVENT_SCHEDULE: SectorEventDefinition[] = [
  {
    id: "tokyo-blackout",
    title: "Tokyo Blackout",
    description: "Neon grid instability — listening sectors amplified.",
    weekOfYear: 10,
    bonusXpPercent: 15,
    vocabularyTag: "urban-signal",
  },
  {
    id: "archive-collapse",
    title: "Archive Collapse",
    description: "Cold storage breach — archive vocabulary surges.",
    weekOfYear: 22,
    bonusXpPercent: 12,
    vocabularyTag: "archive-ghost",
  },
  {
    id: "signal-contamination",
    title: "Signal Contamination",
    description: "Wideband interference — corruption drift elevated.",
    weekOfYear: 35,
    bonusXpPercent: 10,
  },
  {
    id: "ghost-frequency",
    title: "Ghost Frequency Breach",
    description: "Spectral dialogue anomalies detected network-wide.",
    weekOfYear: 44,
    bonusXpPercent: 18,
    vocabularyTag: "spectral",
  },
]

function isoWeekOfYear(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const day = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86_400_000 + 1) / 7)
}

function hashSeed(seed: string): number {
  let h = 0
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0
  }
  return h
}

export function getActiveSectorEvent(
  seed?: string
): SectorEventDefinition | null {
  if (!FEATURE_FLAGS.LIVE_SECTOR_EVENTS) return null
  return getWeeklyRotationEvent(seed)
}

export function sectorEventXpMultiplier(event: SectorEventDefinition | null): number {
  if (!event?.bonusXpPercent) return 1
  return 1 + event.bonusXpPercent / 100
}

/** Weekly rotation — cycles schedule when no fixed week match. */
export function getWeeklyRotationEvent(
  seed?: string,
  date = new Date()
): SectorEventDefinition {
  const week = isoWeekOfYear(date)
  const matched = SECTOR_EVENT_SCHEDULE.find((e) => e.weekOfYear === week)
  if (matched) return matched
  const index = seed
    ? hashSeed(seed) % SECTOR_EVENT_SCHEDULE.length
    : week % SECTOR_EVENT_SCHEDULE.length
  return SECTOR_EVENT_SCHEDULE[index] ?? SECTOR_EVENT_SCHEDULE[0]!
}
