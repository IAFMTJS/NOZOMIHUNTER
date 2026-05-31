/**
 * Seed content tables (020) from content/seeds/*.json
 * Requires SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY
 */
import fs from "node:fs"
import path from "node:path"
import { createClient } from "@supabase/supabase-js"

const ROOT = process.cwd()
const SEEDS = path.join(ROOT, "content/seeds")

async function upsertTable(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
  table: string,
  rows: Record<string, unknown>[],
  key = "id"
) {
  if (rows.length === 0) return
  const deduped = [...new Map(rows.map((r) => [r[key], r])).values()]
  const { error } = await supabase.from(table).upsert(deduped)
  if (error) throw new Error(`${table}: ${error.message}`)
  console.log(`[ingest:content] ${table} ← ${deduped.length} rows`)
}

async function main() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    console.log("[ingest:content] No credentials — in-memory catalogs remain active.")
    return
  }

  const supabase = createClient(url, key)
  const archivePath = path.join(SEEDS, "content-archive.json")
  if (fs.existsSync(archivePath)) {
    const archive = JSON.parse(fs.readFileSync(archivePath, "utf8")) as Record<
      string,
      unknown
    >[]
    await upsertTable(
      supabase,
      "content_archive_entries",
      archive.map((row) => ({
        id: row.id,
        title: row.title,
        teaser: row.teaser ?? null,
        lore_excerpt: row.lore_excerpt ?? row.loreExcerpt ?? null,
        min_rank: row.min_rank ?? row.minRank ?? null,
        linked_contract_id: row.linked_contract_id ?? row.linkedContractId ?? null,
        required_beat_id: row.required_beat_id ?? row.requiredBeatId ?? null,
        japanese_excerpt: row.japanese_excerpt ?? row.japaneseExcerpt ?? null,
      }))
    )
  }

  const manifestPath = path.join(SEEDS, "asset-manifest.json")
  if (fs.existsSync(manifestPath)) {
    const assets = JSON.parse(fs.readFileSync(manifestPath, "utf8")) as {
      asset_key: string
      category: string
      variant: string
      path: string
      season_id?: string
      min_rank?: string
    }[]
    await upsertTable(
      supabase,
      "asset_manifest",
      assets.map((a) => ({
        asset_key: a.asset_key,
        category: a.category,
        variant: a.variant,
        path: a.path,
        season_id: a.season_id ?? null,
        min_rank: a.min_rank ?? null,
        active: true,
      })),
      "asset_key"
    )
  }

  const bossPath = path.join(SEEDS, "content-boss-phases.json")
  if (fs.existsSync(bossPath)) {
    const phases = JSON.parse(fs.readFileSync(bossPath, "utf8")) as {
      id: string
      boss_key: string
      phase_index: number
      spec: Record<string, unknown>
    }[]
    await upsertTable(supabase, "content_boss_phases", phases)
  }

  const contractsPath = path.join(SEEDS, "content-contracts.json")
  if (fs.existsSync(contractsPath)) {
    const contracts = JSON.parse(fs.readFileSync(contractsPath, "utf8")) as {
      id: string
      title: string
      channel: string
      template: Record<string, unknown>
    }[]
    await upsertTable(
      supabase,
      "content_contracts",
      contracts.map((c) => ({ ...c, active: true }))
    )
  }

  const relicPath = path.join(SEEDS, "content-relic-effects.json")
  if (fs.existsSync(relicPath)) {
    const relics = JSON.parse(fs.readFileSync(relicPath, "utf8")) as Record<string, unknown>[]
    await upsertTable(supabase, "content_relic_effects", relics, "item_key")
  }

  const achievementsPath = path.join(SEEDS, "content-achievements.json")
  if (fs.existsSync(achievementsPath)) {
    const achievements = JSON.parse(fs.readFileSync(achievementsPath, "utf8")) as Record<
      string,
      unknown
    >[]
    await upsertTable(
      supabase,
      "content_achievements",
      achievements.map((a) => ({ ...a, active: true }))
    )
  }

  const beatsPath = path.join(SEEDS, "content-story-beats.json")
  if (fs.existsSync(beatsPath)) {
    const beats = JSON.parse(fs.readFileSync(beatsPath, "utf8")) as Record<string, unknown>[]
    await upsertTable(supabase, "content_story_beats", beats)
  }

  const scriptsPath = path.join(SEEDS, "content-encounter-scripts.json")
  if (fs.existsSync(scriptsPath)) {
    const scripts = JSON.parse(fs.readFileSync(scriptsPath, "utf8")) as {
      id: string
      sector_id?: string
      dungeon_key?: string
      node_id?: string
      script: Record<string, unknown>
    }[]
    await upsertTable(
      supabase,
      "content_encounter_scripts",
      scripts.map((s) => ({
        id: s.id,
        sector_id: s.sector_id ?? null,
        dungeon_key: s.dungeon_key ?? null,
        node_id: s.node_id ?? null,
        script: s.script,
        active: true,
      }))
    )
  }

  console.log("[ingest:content] done")
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
