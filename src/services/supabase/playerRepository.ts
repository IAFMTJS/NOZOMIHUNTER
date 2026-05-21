import { createClient } from "@/lib/supabase/client"
import type { PlayerContract, HunterRank } from "@/contracts/player-contract"
import type { QuestContract } from "@/contracts/quest-contract"
import { defaultProgression } from "@/systems/progression/unlockSystem"

function mapPlayer(
  profile: { id: string; username: string; created_at: string; updated_at: string },
  stats: Record<string, number>,
  prog: Record<string, unknown>,
  penalties: Record<string, number>
): PlayerContract {
  return {
    id: profile.id,
    username: profile.username,
    level: prog.level as number,
    xp: prog.xp as number,
    rank: prog.rank as HunterRank,
    stats: {
      vocabulary: stats.vocabulary ?? 0,
      grammar: stats.grammar ?? 0,
      listening: stats.listening ?? 0,
      speaking: stats.speaking ?? 0,
      confidence: stats.confidence ?? 0,
      intelligence: stats.intelligence ?? 0,
      consistency: stats.consistency ?? 0,
    },
    penalties: {
      corruption: penalties.corruption ?? 0,
      fatigue: penalties.fatigue ?? 0,
      xpDebt: penalties.xp_debt ?? 0,
    },
    progression: {
      unlockedDungeons: (prog.unlocked_dungeons as string[]) ?? [],
      unlockedSystems: (prog.unlocked_systems as string[]) ?? defaultProgression().unlockedSystems,
      titles: (prog.titles as string[]) ?? [],
    },
    createdAt: profile.created_at,
    updatedAt: profile.updated_at,
  }
}

export async function loadPlayer(userId: string): Promise<{
  player: PlayerContract
  activeQuests: QuestContract[]
} | null> {
  const supabase = createClient()

  const [profileRes, statsRes, progRes, penRes, questsRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).single(),
    supabase.from("player_stats").select("*").eq("user_id", userId).single(),
    supabase.from("progression").select("*").eq("user_id", userId).single(),
    supabase.from("player_penalties").select("*").eq("user_id", userId).single(),
    supabase
      .from("user_quests")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active"),
  ])

  if (profileRes.error || !profileRes.data) return null

  const player = mapPlayer(
    profileRes.data,
    statsRes.data ?? {},
    progRes.data ?? { level: 1, xp: 0, rank: "E" },
    penRes.data ?? {}
  )

  const activeQuests: QuestContract[] = (questsRes.data ?? []).map((row) =>
    row.quest_snapshot as QuestContract
  )

  return { player, activeQuests }
}

export async function savePlayer(
  player: PlayerContract,
  activeQuests: QuestContract[]
): Promise<void> {
  const supabase = createClient()

  await Promise.all([
    supabase
      .from("profiles")
      .update({
        username: player.username,
        updated_at: new Date().toISOString(),
      })
      .eq("id", player.id),
    supabase.from("player_stats").upsert({
      user_id: player.id,
      vocabulary: player.stats.vocabulary,
      grammar: player.stats.grammar,
      listening: player.stats.listening,
      speaking: player.stats.speaking,
      confidence: player.stats.confidence,
      intelligence: player.stats.intelligence,
      consistency: player.stats.consistency,
    }),
    supabase.from("progression").upsert({
      user_id: player.id,
      level: player.level,
      xp: player.xp,
      rank: player.rank,
      unlocked_systems: player.progression.unlockedSystems,
      unlocked_dungeons: player.progression.unlockedDungeons,
      titles: player.progression.titles,
    }),
    supabase.from("player_penalties").upsert({
      user_id: player.id,
      corruption: player.penalties.corruption,
      fatigue: player.penalties.fatigue,
      xp_debt: player.penalties.xpDebt,
    }),
  ])

  for (const quest of activeQuests) {
    await supabase.from("user_quests").upsert({
      user_id: player.id,
      quest_id: quest.id.startsWith("quest-") ? null : quest.id,
      status: "active",
      quest_snapshot: quest,
      progress: { objectives: quest.objectives },
      updated_at: new Date().toISOString(),
    })
  }
}

export async function assignQuest(
  userId: string,
  quest: QuestContract
): Promise<void> {
  const supabase = createClient()
  await supabase.from("user_quests").insert({
    user_id: userId,
    quest_id: null,
    status: "active",
    quest_snapshot: quest,
    progress: { objectives: quest.objectives },
  })
}

export async function completeUserQuest(
  userId: string,
  questId: string
): Promise<void> {
  const supabase = createClient()
  const { data: rows } = await supabase
    .from("user_quests")
    .select("id, quest_snapshot")
    .eq("user_id", userId)
    .eq("status", "active")

  const row = (rows ?? []).find(
    (r) => (r.quest_snapshot as { id?: string })?.id === questId
  )

  if (row) {
    await supabase
      .from("user_quests")
      .update({ status: "completed", updated_at: new Date().toISOString() })
      .eq("id", row.id)
  }
}
