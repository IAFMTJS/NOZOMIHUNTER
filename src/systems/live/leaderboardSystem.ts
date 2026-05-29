import type { GameplayEventRow } from "@/services/supabase/recordsRepository"

export interface LeaderboardEntry {
  rank: number
  label: string
  score: number
  tier: string
}

const SCORE_EVENTS = new Set([
  "QUEST_COMPLETED",
  "DUNGEON_COMPLETED",
  "SECTOR_CLEARED",
  "ENCOUNTER_COMPLETED",
])

/** Aggregate operator score from gameplay_events (per-user until global RPC exists). */
export function aggregateLeaderboardFromEvents(
  events: GameplayEventRow[],
  operatorLabel: string
): LeaderboardEntry[] {
  let score = 0
  for (const ev of events) {
    if (!SCORE_EVENTS.has(ev.event_type)) continue
    const bonus = typeof ev.payload?.xp === "number" ? Math.floor(ev.payload.xp / 10) : 5
    score += bonus
  }

  const self: LeaderboardEntry = {
    rank: 1,
    label: operatorLabel,
    score,
    tier: score >= 200 ? "SSS" : score >= 120 ? "SS" : score >= 60 ? "S" : "A",
  }

  const preview: LeaderboardEntry[] = [
    self,
    { rank: 2, label: "Sector relay — pending", score: Math.max(0, score - 15), tier: "S" },
    { rank: 3, label: "Sector relay — pending", score: Math.max(0, score - 30), tier: "A" },
  ]

  return preview.sort((a, b) => b.score - a.score).map((row, i) => ({
    ...row,
    rank: i + 1,
  }))
}

/** Fallback when events are unavailable. */
export function buildLeaderboardPreview(): LeaderboardEntry[] {
  return [
    { rank: 1, label: "Operator — pending sync", score: 0, tier: "SSS" },
    { rank: 2, label: "Operator — pending sync", score: 0, tier: "SS" },
    { rank: 3, label: "Operator — pending sync", score: 0, tier: "S" },
  ]
}

export async function fetchLeaderboardFromEvents(
  events: GameplayEventRow[],
  operatorLabel: string
): Promise<LeaderboardEntry[]> {
  if (events.length === 0) return buildLeaderboardPreview()
  return aggregateLeaderboardFromEvents(events, operatorLabel)
}
