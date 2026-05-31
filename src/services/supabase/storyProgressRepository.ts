import { createClient } from "@/lib/supabase/client"
import type { StoryProgressContract } from "@/contracts/narrative-contract"
import {
  DEFAULT_STORY_PROGRESS,
  irisTrustTierFromScore,
} from "@/contracts/narrative-contract"

function requireClient() {
  const supabase = createClient()
  if (!supabase) throw new Error("Supabase is not configured")
  return supabase
}

function mapRow(row: Record<string, unknown>): StoryProgressContract {
  const irisTrust = (row.iris_trust as number) ?? 0
  const archiveRaw = row.archive_index
  const archiveUnlockedIds = Array.isArray(archiveRaw)
    ? (archiveRaw as string[])
    : []
  return {
    seasonId: (row.season_id as string) ?? "season-01-broken-signal",
    currentBeatId: (row.current_beat_id as string) ?? null,
    completedBeatIds: (row.completed_beat_ids as string[]) ?? [],
    storyFlags: (row.story_flags as StoryProgressContract["storyFlags"]) ?? {},
    irisTrust,
    irisTrustTier: irisTrustTierFromScore(irisTrust),
    factionRep:
      (row.faction_rep as StoryProgressContract["factionRep"]) ?? {
        hunters: 50,
      },
    archiveUnlockedIds,
    updatedAt: row.updated_at as string | undefined,
  }
}

export async function loadStoryProgress(
  userId: string
): Promise<StoryProgressContract> {
  const supabase = requireClient()
  const { data, error } = await supabase
    .from("player_story_progress")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle()

  if (error || !data) return DEFAULT_STORY_PROGRESS()
  return mapRow(data as Record<string, unknown>)
}

export async function completeStoryBeatRemote(
  userId: string,
  beatId: string,
  seasonId = "season-01-broken-signal",
  irisTrustDelta = 5
): Promise<StoryProgressContract | null> {
  const supabase = requireClient()
  const { data, error } = await supabase.rpc("complete_story_beat", {
    p_user_id: userId,
    p_beat_id: beatId,
    p_season_id: seasonId,
    p_iris_trust_delta: irisTrustDelta,
  })

  if (error || !data) return null
  return mapRow(data as Record<string, unknown>)
}
