import { createClient } from "@/lib/supabase/client"
import type { HunterRank, PlayerContract } from "@/contracts/player-contract"

export interface GuardedQuestCompletionResult {
  ok: boolean
  quest_id: string
  xp: number
  level: number
  rank: HunterRank
  xp_gained: number
  credits_gained?: number
  previous_xp: number
  previous_level: number
  pending_rewards?: unknown
}

function requireClient() {
  const supabase = createClient()
  if (!supabase) {
    throw new Error("Supabase is not configured")
  }
  return supabase
}

export async function applyGuardedProgression(player: PlayerContract): Promise<void> {
  const supabase = requireClient()
  const { error } = await supabase.rpc("apply_guarded_progression", {
    p_xp: player.xp,
    p_level: player.level,
    p_rank: player.rank,
    p_unlocked_systems: player.progression.unlockedSystems,
    p_unlocked_dungeons: player.progression.unlockedDungeons,
    p_titles: player.progression.titles,
    p_rpg_strength: player.rpgStats.strength,
    p_rpg_agility: player.rpgStats.agility,
    p_rpg_intelligence: player.rpgStats.intelligence,
    p_rpg_vitality: player.rpgStats.vitality,
  })

  if (error) {
    throw new Error(error.message)
  }
}

export async function completeQuestGuarded(
  questId: string,
  xpClaimed: number
): Promise<GuardedQuestCompletionResult> {
  const supabase = requireClient()
  const { data, error } = await supabase.rpc("complete_quest_guarded", {
    p_quest_id: questId,
    p_xp_claimed: xpClaimed,
  })

  if (error) {
    throw new Error(error.message)
  }

  const row = data as Record<string, unknown>
  return {
    ok: Boolean(row.ok),
    quest_id: String(row.quest_id),
    xp: Number(row.xp),
    level: Number(row.level),
    rank: String(row.rank) as HunterRank,
    xp_gained: Number(row.xp_gained),
    credits_gained: Number(row.credits_gained ?? 0),
    previous_xp: Number(row.previous_xp),
    previous_level: Number(row.previous_level),
    pending_rewards: row.pending_rewards,
  }
}

export async function recordGameplayEvent(
  eventType: string,
  payload: unknown
): Promise<void> {
  const supabase = createClient()
  if (!supabase) return

  const { error } = await supabase.rpc("record_gameplay_event", {
    p_event_type: eventType,
    p_payload: payload as Record<string, unknown>,
  })

  if (error) {
    return
  }
}

export async function applyGameModeActionGuarded(
  questId: string,
  action: string,
  payload: string | undefined,
  nextSnapshot: Record<string, unknown>
): Promise<void> {
  const supabase = requireClient()
  const { error } = await supabase.rpc("apply_game_mode_action_guarded", {
    p_quest_id: questId,
    p_action: action,
    p_payload: payload ?? "",
    p_next_snapshot: nextSnapshot,
  })

  if (error) {
    throw new Error(error.message)
  }
}

export async function checkGameModeRateLimitServer(): Promise<boolean> {
  const supabase = requireClient()
  const { data, error } = await supabase.rpc("check_player_rate_limit", {
    p_action_type: "game_mode_action",
    p_max_per_window: 60,
    p_window_ms: 60_000,
  })

  if (error) {
    return true
  }
  return data === true
}

export async function checkSpeechRateLimitServer(): Promise<boolean> {
  const supabase = requireClient()
  const { data, error } = await supabase.rpc("check_player_rate_limit", {
    p_action_type: "speech_submit",
    p_max_per_window: 24,
    p_window_ms: 60_000,
  })

  if (error) {
    return true
  }
  return data === true
}
