import { createClient } from "@/lib/supabase/client"
import type { PlayerContract, HunterRank } from "@/contracts/player-contract"
import type { QuestContract } from "@/contracts/quest-contract"
import type { ProfileRow } from "@/types/database"
import {
  defaultProgression,
  normalizeUnlockedSystems,
} from "@/systems/progression/unlockSystem"
import { dedupeActiveQuests } from "@/systems/quests/questListUtils"
import { mergeQuestRow } from "@/systems/quests/questEncounterRepair"
import { applyGuardedProgression } from "@/services/supabase/progressionRepository"
import { loadPlayerInventory } from "@/services/supabase/inventoryRepository"
import { applyDailyStaminaGuarded } from "@/services/supabase/economyRepository"
import { resolveHunterIdentity } from "@/systems/identity/hunterIdentitySystem"
import { computeSynchronizationStatus } from "@/systems/synchronization/synchronizationSystem"
import { defaultEconomy } from "@/systems/economy/staminaSystem"
import { parsePendingRewards } from "@/systems/rewards/rewardClaimSystem"
import { PlayerSchema } from "@/systems/validation/playerSchema"
import { logSystemEvent } from "@/systems/logger/logger"
import type { ProgressionRow } from "@/types/database"

function requireClient() {
  const supabase = createClient()
  if (!supabase) {
    throw new Error("Supabase is not configured")
  }
  return supabase
}

function mapEconomy(prog: Record<string, unknown>) {
  const row = prog as unknown as ProgressionRow
  const base = defaultEconomy()
  return {
    credits: row.credits ?? base.credits,
    stamina: row.stamina ?? base.stamina,
    staminaMax: row.stamina_max ?? base.staminaMax,
    brewTokens: row.brew_tokens ?? base.brewTokens,
  }
}

function mapPlayer(
  profile: ProfileRow,
  stats: Record<string, number>,
  prog: Record<string, unknown>,
  penalties: Record<string, number>,
  inventory: PlayerContract["inventory"],
  trackedQuestSnapshotId: string | null,
  pendingRaw: unknown
): PlayerContract {
  const identity = resolveHunterIdentity(profile.id, {
    codename: profile.hunter_codename ?? undefined,
    registryId: profile.registry_id ?? undefined,
  })
  const chainDays = profile.sync_chain_days ?? 0
  const lastActive = profile.last_active_date ?? null
  const syncView = computeSynchronizationStatus(lastActive, chainDays)

  return {
    id: profile.id,
    username: profile.username,
    identity,
    synchronization: {
      chainDays,
      lastActiveDate: lastActive,
      status: syncView.status,
      atRisk: syncView.atRisk,
    },
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
      unlockedSystems: normalizeUnlockedSystems(
        (prog.unlocked_systems as string[]) ?? defaultProgression().unlockedSystems
      ),
      titles: (prog.titles as string[]) ?? [],
    },
    economy: mapEconomy(prog),
    inventory,
    trackedQuestId: trackedQuestSnapshotId,
    pendingRewards: parsePendingRewards(
      pendingRaw ?? (prog as unknown as ProgressionRow).pending_rewards
    ),
    createdAt: profile.created_at,
    updatedAt: profile.updated_at,
  }
}

export async function loadPlayer(userId: string): Promise<{
  player: PlayerContract
  activeQuests: QuestContract[]
  identityBackfill: boolean
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

  try {
    await applyDailyStaminaGuarded()
  } catch {
    /* offline / migration pending */
  }

  const inventory = await loadPlayerInventory(userId)

  let trackedSnapshotId: string | null = null
  if (profileRes.data.tracked_quest_id && questsRes.data?.length) {
    const row = questsRes.data.find((r) => r.id === profileRes.data.tracked_quest_id)
    if (row) {
      trackedSnapshotId = (row.quest_snapshot as { id?: string })?.id ?? null
    }
  }

  let player = mapPlayer(
    profileRes.data,
    statsRes.data ?? {},
    progRes.data ?? { level: 1, xp: 0, rank: "E" },
    penRes.data ?? {},
    inventory,
    trackedSnapshotId,
    (progRes.data as unknown as ProgressionRow | null)?.pending_rewards
  )

  const parsed = PlayerSchema.safeParse({
    id: player.id,
    username: player.username,
    level: player.level,
    xp: player.xp,
    rank: player.rank,
    economy: player.economy,
    inventory: player.inventory,
    trackedQuestId: player.trackedQuestId,
  })
  if (!parsed.success) {
    logSystemEvent("validation", "player_schema_drift", parsed.error.flatten())
  }

  const activeQuests = dedupeActiveQuests(
    (questsRes.data ?? []).map((row) =>
      mergeQuestRow(
        row.quest_snapshot as QuestContract,
        row.progress as Record<string, unknown> | null
      )
    )
  )

  const identityBackfill =
    !profileRes.data.hunter_codename || !profileRes.data.registry_id

  return { player, activeQuests, identityBackfill }
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
        hunter_codename: player.identity.codename,
        registry_id: player.identity.registryId,
        last_active_date: player.synchronization.lastActiveDate,
        sync_chain_days: player.synchronization.chainDays,
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
    supabase
      .from("progression")
      .update({
        credits: player.economy.credits,
        stamina: player.economy.stamina,
        stamina_max: player.economy.staminaMax,
        brew_tokens: player.economy.brewTokens,
        pending_rewards: player.pendingRewards,
      })
      .eq("user_id", player.id),
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

export async function findActiveQuestRowId(
  userId: string,
  questId: string
): Promise<string | null> {
  const row = await findActiveQuestRow(userId, questId)
  return row?.id ?? null
}

export async function loadCompletedQuestSnapshots(
  userId: string,
  limit = 20
): Promise<QuestContract[]> {
  const supabase = requireClient()
  const { data, error } = await supabase
    .from("user_quests")
    .select("quest_snapshot")
    .eq("user_id", userId)
    .eq("status", "completed")
    .order("updated_at", { ascending: false })
    .limit(limit)

  if (error) throw new Error(error.message)
  return (data ?? []).map((row) => row.quest_snapshot as QuestContract)
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
