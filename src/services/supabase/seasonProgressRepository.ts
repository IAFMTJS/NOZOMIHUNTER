import { createClient } from "@/lib/supabase/client"
import { getActiveSeason } from "@/config/seasonConfig"

export interface SeasonProgressRow {
  points: number
  tier: number
}

export async function loadSeasonProgress(
  userId: string
): Promise<SeasonProgressRow | null> {
  const season = getActiveSeason()
  if (!season) return null

  const supabase = createClient()
  if (!supabase) return null

  const { data, error } = await supabase
    .from("season_progress")
    .select("points, tier")
    .eq("user_id", userId)
    .eq("season_id", season.id)
    .maybeSingle()

  if (error || !data) return null
  return {
    points: data.points as number,
    tier: data.tier as number,
  }
}

export async function addSeasonPoints(points: number): Promise<void> {
  const season = getActiveSeason()
  if (!season || points <= 0) return

  const supabase = createClient()
  if (!supabase) return

  await supabase.rpc("add_season_points", {
    p_season_id: season.id,
    p_points: points,
  })
}
