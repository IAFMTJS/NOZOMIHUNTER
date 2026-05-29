import { createClient } from "@/lib/supabase/client"
import { setAssetManifestCache } from "@/systems/content/assetManifestSystem"
import {
  fallbackAssetManifest,
  type AssetManifestEntry,
} from "@/config/assetManifestFallback"
import {
  setArchiveEntriesFromDb,
  type ArchiveEntry,
} from "@/systems/archive/archiveSystem"
import { setBossPhasesFromDb } from "@/systems/content/contentBossPhaseCache"
import {
  setContentContractTemplates,
  type ContentContractTemplate,
} from "@/systems/content/contentContractTemplateSystem"
import { setContentAchievementsFromDb } from "@/systems/content/contentAchievementCatalog"
import type { DungeonBossPhaseSpec } from "@/contracts/dungeon-contract"
import type { HunterRank } from "@/contracts/player-contract"

const RANK_ORDER: HunterRank[] = ["E", "D", "C", "B", "A", "S", "SS", "SSS"]

function rankMeets(minRank: string | null | undefined, playerRank: HunterRank): boolean {
  if (!minRank) return true
  const need = RANK_ORDER.indexOf(minRank as HunterRank)
  const have = RANK_ORDER.indexOf(playerRank)
  return need >= 0 && have >= need
}

export async function loadAssetManifestFromDb(): Promise<AssetManifestEntry[]> {
  const supabase = createClient()
  if (!supabase) return fallbackAssetManifest()

  const { data, error } = await supabase
    .from("asset_manifest")
    .select("asset_key, category, variant, path, season_id, min_rank")
    .eq("active", true)

  if (error || !data?.length) return fallbackAssetManifest()

  const entries = data.map((row) => ({
    asset_key: row.asset_key as string,
    category: row.category as string,
    variant: (row.variant as string) ?? "default",
    path: row.path as string,
    season_id: (row.season_id as string) ?? undefined,
    min_rank: (row.min_rank as string) ?? undefined,
  }))

  setAssetManifestCache(entries)
  return entries
}

export async function loadArchiveEntriesFromDb(
  playerRank: HunterRank = "E"
): Promise<ArchiveEntry[]> {
  const supabase = createClient()
  if (!supabase) return []

  const { data, error } = await supabase
    .from("content_archive_entries")
    .select("id, title, teaser, lore_excerpt, min_rank, linked_contract_id")

  if (error || !data?.length) return []

  const entries: ArchiveEntry[] = data.map((row) => {
    const locked = !rankMeets(row.min_rank as string | null, playerRank)
    return {
      id: row.id as string,
      title: row.title as string,
      teaser: row.teaser as string,
      loreExcerpt: (row.lore_excerpt as string) ?? undefined,
      locked,
      lockReason: locked
        ? `Requires rank ${row.min_rank ?? "higher"}`
        : undefined,
      linkedContractId: (row.linked_contract_id as string) ?? undefined,
    }
  })

  setArchiveEntriesFromDb(entries)
  return entries
}

export async function loadBossPhasesFromDb(): Promise<void> {
  const supabase = createClient()
  if (!supabase) return

  const { data, error } = await supabase
    .from("content_boss_phases")
    .select("boss_key, phase_index, spec")

  if (error || !data?.length) return

  setBossPhasesFromDb(
    data.map((row) => ({
      boss_key: row.boss_key as string,
      phase_index: row.phase_index as number,
      spec: row.spec as DungeonBossPhaseSpec,
    }))
  )
}

export async function loadContentContractsFromDb(): Promise<ContentContractTemplate[]> {
  const supabase = createClient()
  if (!supabase) return []

  const { data, error } = await supabase
    .from("content_contracts")
    .select("id, title, channel, template")
    .eq("active", true)

  if (error || !data?.length) return []

  const rows = data.map((row) => ({
    id: row.id as string,
    title: row.title as string,
    channel: row.channel as string,
    template: row.template as ContentContractTemplate["template"],
  }))

  setContentContractTemplates(rows)
  return rows
}

export async function loadContentAchievementsFromDb(): Promise<void> {
  const supabase = createClient()
  if (!supabase) return

  const { data, error } = await supabase
    .from("content_achievements")
    .select("id, title, description, unlock_key")
    .eq("active", true)

  if (error || !data?.length) return

  setContentAchievementsFromDb(
    data.map((row) => ({
      id: row.id as string,
      title: row.title as string,
      description: row.description as string,
      unlock_key: (row.unlock_key as string) ?? null,
    }))
  )
}
