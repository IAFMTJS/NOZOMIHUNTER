export interface SeasonDefinition {
  id: string
  label: string
  start: string
  end: string
  modifierHint?: string
}

export interface SeasonNarrativePhase {
  id: string
  actId: string
  title: string
  /** Inclusive mission index range (Season 1 main graph). */
  missionRange: [number, number]
}

export const SEASON_SCHEDULE: SeasonDefinition[] = [
  {
    id: "season-01-broken-signal",
    label: "Broken Signal",
    start: "2026-01-01",
    end: "2026-12-31",
    modifierHint: "Corruption drift elevated on anomaly routes",
  },
  {
    id: "fracture-week",
    label: "Fracture Week",
    start: "2026-01-01",
    end: "2026-06-30",
    modifierHint: "Corruption drift +10% on greedy routes",
  },
]

export const BROKEN_SIGNAL_NARRATIVE_PHASES: SeasonNarrativePhase[] = [
  { id: "awakening", actId: "act-1", title: "Awakening", missionRange: [1, 8] },
  { id: "static", actId: "act-2", title: "Static", missionRange: [9, 16] },
  { id: "debt", actId: "act-3", title: "Debt", missionRange: [17, 22] },
  { id: "horizon", actId: "act-4", title: "Horizon", missionRange: [23, 24] },
]

export function getActiveSeason(date = new Date()): SeasonDefinition | null {
  const key = date.toISOString().slice(0, 10)
  return (
    SEASON_SCHEDULE.find((s) => key >= s.start && key <= s.end) ?? null
  )
}

export function getPrimarySeason(date = new Date()): SeasonDefinition | null {
  const key = date.toISOString().slice(0, 10)
  const broken = SEASON_SCHEDULE.find((s) => s.id === "season-01-broken-signal")
  if (broken && key >= broken.start && key <= broken.end) return broken
  return getActiveSeason(date)
}

export function resolveNarrativePhase(
  completedMissionCount: number
): SeasonNarrativePhase {
  const count = Math.max(0, completedMissionCount)
  for (const phase of BROKEN_SIGNAL_NARRATIVE_PHASES) {
    const [lo, hi] = phase.missionRange
    if (count >= lo - 1 && count < hi) return phase
  }
  return (
    BROKEN_SIGNAL_NARRATIVE_PHASES[BROKEN_SIGNAL_NARRATIVE_PHASES.length - 1] ??
    BROKEN_SIGNAL_NARRATIVE_PHASES[0]!
  )
}
