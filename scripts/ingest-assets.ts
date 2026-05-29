/**
 * Upload local public/game-assets + seed asset_manifest rows.
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in env.
 */
import fs from "node:fs"
import path from "node:path"
import { createClient } from "@supabase/supabase-js"

const ROOT = process.cwd()
const MANIFEST_PATH = path.join(ROOT, "content/seeds/asset-manifest.json")
const ASSETS_DIR = path.join(ROOT, "public/game-assets")

interface ManifestRow {
  asset_key: string
  category: string
  variant: string
  path: string
  season_id?: string
  min_rank?: string
}

async function main() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    console.log("[ingest:assets] No service credentials — manifest JSON is used as fallback only.")
    return
  }

  const supabase = createClient(url, key)
  const rows = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8")) as ManifestRow[]

  for (const row of rows) {
    const rel = row.path.replace(/^\//, "")
    const localPath = path.join(ROOT, "public", rel)
    if (!fs.existsSync(localPath)) {
      console.warn(`[ingest:assets] skip missing file: ${rel}`)
      continue
    }
    const storagePath = rel.replace(/^game-assets\//, "")
    const body = fs.readFileSync(localPath)
    const contentType = localPath.endsWith(".svg")
      ? "image/svg+xml"
      : "image/png"
    const { error: upErr } = await supabase.storage
      .from("game-assets")
      .upload(storagePath, body, { upsert: true, contentType })
    if (upErr) {
      console.warn(`[ingest:assets] upload ${storagePath}:`, upErr.message)
    }
    const publicUrl = `${url}/storage/v1/object/public/game-assets/${storagePath}`
    const { error: dbErr } = await supabase.from("asset_manifest").upsert({
      asset_key: row.asset_key,
      category: row.category,
      variant: row.variant,
      path: publicUrl,
      season_id: row.season_id ?? null,
      min_rank: row.min_rank ?? null,
      active: true,
    })
    if (dbErr) console.warn(`[ingest:assets] db ${row.asset_key}:`, dbErr.message)
    else console.log(`[ingest:assets] OK ${row.asset_key}`)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
