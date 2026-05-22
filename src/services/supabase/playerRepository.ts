import { createClient } from "@/lib/supabase/client"
import type { PlayerContract, HunterRank } from "@/contracts/player-contract"
import type { QuestContract } from "@/contracts/quest-contract"
import { defaultProgression } from "@/systems/progression/unlockSystem"
import { dedupeActiveQuests } from "@/systems/quests/questListUtils"
import { mergeQuestRow } from "@/systems/quests/questEncounterRepair"
import { applyGuardedProgression } from "@/services/supabase/progressionRepository"

function requireClient() {
  const supabase = createClient()
  if (!supabase) {
    throw new Error("Supabase is not configured")
  }
  return supabase
}

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
  const supabase = requireClient()

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

  const activeQuests = dedupeActiveQuests(
    (questsRes.data ?? []).map((row) =>
      mergeQuestRow(
        row.quest_snapshot as QuestContract,
        row.progress as Record<string, unknown> | null
      )
    )
  )

  return { player, activeQuests }
}

export async function savePlayer(
  player: PlayerContract,
  activeQuests: QuestContract[]
): Promise<void> {
  const supabase = requireClient()

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
    applyGuardedProgression(player),
    supabase.from("player_penalties").upsert({
      user_id: player.id,
      corruption: player.penalties.corruption,
      fatigue: player.penalties.fatigue,
      xp_debt: player.penalties.xpDebt,
    }),
  ])

  for (const quest of dedupeActiveQuests(activeQuests)) {
    await updateUserQuest(player.id, quest)
  }
}

export async function assignQuest(
  userId: string,
  quest: QuestContract
): Promise<void> {
  const existing = await findActiveQuestRow(userId, quest.id)
  if (existing) {
    await updateUserQuest(userId, quest)
    return
  }

  const supabase = requireClient()
  await supabase.from("user_quests").insert({
    user_id: userId,
    quest_id: null,
    status: "active",
    quest_snapshot: quest,
    progress: {
      objectives: quest.objectives,
      vocabularyEncounter: quest.vocabularyEncounter,
      conversationEncounter: quest.conversationEncounter,
      speechEncounter: quest.speechEncounter,
      listeningEncounter: quest.listeningEncounter,
      dungeonRun: quest.dungeonRun,
    },
  })
}

async function findActiveQuestRow(
  userId: string,
  questId: string
): Promise<{ id: string } | null> {
  const supabase = requireClient()
  const { data: rows } = await supabase
    .from("user_quests")
    .select("id, quest_snapshot")
    .eq("user_id", userId)
    .eq("status", "active")

  const row = (rows ?? []).find(
    (r) => (r.quest_snapshot as { id?: string })?.id === questId
  )
  return row ? { id: row.id } : null
}

export async function updateUserQuest(
  userId: string,
  quest: QuestContract
): Promise<void> {
  const supabase = requireClient()
  const row = await findActiveQuestRow(userId, quest.id)
  if (!row) return

  await supabase
    .from("user_quests")
    .update({
      quest_snapshot: quest,
      progress: {
        objectives: quest.objectives,
        vocabularyEncounter: quest.vocabularyEncounter,
        conversationEncounter: quest.conversationEncounter,
        speechEncounter: quest.speechEncounter,
        listeningEncounter: quest.listeningEncounter,
        dungeonRun: quest.dungeonRun,
      },
      updated_at: new Date().toISOString(),
    })
    .eq("id", row.id)
}

async function setQuestStatusForSnapshot(
  userId: string,
  questId: string,
  status: "completed" | "failed"
): Promise<void> {
  const supabase = requireClient()
  const { data: rows } = await supabase
    .from("user_quests")
    .select("id, quest_snapshot")
    .eq("user_id", userId)
    .eq("status", "active")

  const matching = (rows ?? []).filter(
    (r) => (r.quest_snapshot as { id?: string })?.id === questId
  )

  for (const row of matching) {
    await supabase
      .from("user_quests")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", row.id)
  }
}

export async function completeUserQuest(
  userId: string,
  questId: string
): Promise<void> {
  await setQuestStatusForSnapshot(userId, questId, "completed")
}

export async function failUserQuest(
  userId: string,
  questId: string
): Promise<void> {
  await setQuestStatusForSnapshot(userId, questId, "failed")
}
