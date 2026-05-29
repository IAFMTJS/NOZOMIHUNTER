import { createClient } from "@/lib/supabase/client"
import type { LeaderboardEntry } from "@/systems/live/leaderboardSystem"
import { buildLeaderboardPreview } from "@/systems/live/leaderboardSystem"

function mapRows(
  data: { username: string; score: number; tier: string }[]
): LeaderboardEntry[] {
  return data.map((row, i) => ({
    rank: i + 1,
    label: row.username as string,
    score: Number(row.score ?? 0),
    tier: row.tier as string,
  }))
}

export async function fetchGlobalLeaderboard(limit = 20): Promise<LeaderboardEntry[]> {
  const supabase = createClient()
  if (!supabase) return buildLeaderboardPreview()

  const { data, error } = await supabase.rpc("leaderboard_aggregate", {
    p_limit: limit,
  })

  if (error || !data?.length) return buildLeaderboardPreview()
  return mapRows(data)
}

export async function fetchLifetimeLeaderboard(limit = 20): Promise<LeaderboardEntry[]> {
  const supabase = createClient()
  if (!supabase) return buildLeaderboardPreview()

  const { data, error } = await supabase.rpc("leaderboard_aggregate_lifetime", {
    p_limit: limit,
  })

  if (error || !data?.length) return fetchGlobalLeaderboard(limit)
  return mapRows(data)
}
