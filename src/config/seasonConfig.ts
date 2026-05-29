export interface SeasonDefinition {
  id: string
  label: string
  start: string
  end: string
  modifierHint?: string
}

export const SEASON_SCHEDULE: SeasonDefinition[] = [
  {
    id: "fracture-week",
    label: "Fracture Week",
    start: "2026-01-01",
    end: "2026-06-30",
    modifierHint: "Corruption drift +10% on greedy routes",
  },
]

export function getActiveSeason(date = new Date()): SeasonDefinition | null {
  const key = date.toISOString().slice(0, 10)
  return (
    SEASON_SCHEDULE.find((s) => key >= s.start && key <= s.end) ?? null
  )
}
