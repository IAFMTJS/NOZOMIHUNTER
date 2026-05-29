#!/usr/bin/env node
/**
 * Post-deploy verification — row counts + RPC smoke test.
 * Loads .env.local when present. Requires service role for full checks.
 */
import fs from "node:fs"
import path from "node:path"
import { createClient } from "@supabase/supabase-js"

const ROOT = process.cwd()

function loadEnvLocal() {
  const envPath = path.join(ROOT, ".env.local")
  if (!fs.existsSync(envPath)) return
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const t = line.trim()
    if (!t || t.startsWith("#")) continue
    const i = t.indexOf("=")
    if (i < 1) continue
    const k = t.slice(0, i).trim()
    let v = t.slice(i + 1).trim()
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1)
    }
    if (!process.env[k]) process.env[k] = v
  }
}

loadEnvLocal()

const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY

async function main() {
  if (!url || !key) {
    console.error("[verify:deploy] Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
    process.exit(1)
  }

  const supabase = createClient(url, key)
  let failed = false

  async function count(table, min) {
    const { count, error } = await supabase.from(table).select("*", { count: "exact", head: true })
    if (error) {
      console.error(`[verify:deploy] ${table}: ${error.message}`)
      failed = true
      return
    }
    const ok = (count ?? 0) >= min
    console.log(`[verify:deploy] ${table}: ${count ?? 0} ${ok ? "OK" : `(expected >= ${min})`}`)
    if (!ok) failed = true
  }

  await count("content_contracts", 100)
  await count("content_archive_entries", 25)
  await count("content_boss_phases", 18)
  await count("asset_manifest", 15)
  await count("content_relic_effects", 5)
  await count("content_achievements", 30)

  const { data: lb, error: lbErr } = await supabase.rpc("leaderboard_aggregate", { p_limit: 5 })
  if (lbErr) {
    console.error(`[verify:deploy] leaderboard_aggregate: ${lbErr.message}`)
    failed = true
  } else {
    console.log(`[verify:deploy] leaderboard_aggregate: ${lb?.length ?? 0} rows OK`)
  }

  const { data: buckets } = await supabase.storage.listBuckets()
  const hasAssets = buckets?.some((b) => b.name === "game-assets")
  console.log(`[verify:deploy] game-assets bucket: ${hasAssets ? "OK" : "MISSING"}`)
  if (!hasAssets) failed = true

  if (failed) process.exit(1)
  console.log("[verify:deploy] All checks passed")
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
