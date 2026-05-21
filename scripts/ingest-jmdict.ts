/**
 * Ingest JMDict XML into Supabase vocabulary_entries.
 *
 * Usage:
 *   npx tsx scripts/ingest-jmdict.ts <path-to-jmdict.xml>
 *
 * Requires in .env.local (or env):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY  (bypasses RLS for bulk upsert)
 */
import { existsSync, readFileSync } from "fs"
import { resolve } from "path"
import { createClient } from "@supabase/supabase-js"
import { parseJmdictXml } from "../src/services/jmdict/parser"
import { buildSearchText } from "../src/services/jmdict/normalize"

function loadEnvLocal(): void {
  const envPath = resolve(process.cwd(), ".env.local")
  if (!existsSync(envPath)) return
  for (const line of readFileSync(envPath, "utf-8").split("\n")) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const eq = trimmed.indexOf("=")
    if (eq <= 0) continue
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }
    if (!process.env[key]) process.env[key] = value
  }
}

loadEnvLocal()

const JMDICT_DOWNLOAD =
  "https://www.edrdg.org/wiki/index.php/JMdict_e"

const xmlPath = process.argv[2]
if (!xmlPath) {
  console.log("Usage: npm run ingest:jmdict -- <path-to-JMdict_e.xml>")
  console.log(`Download XML: ${JMDICT_DOWNLOAD}`)
  process.exit(1)
}

const resolvedXml = resolve(xmlPath)
if (!existsSync(resolvedXml)) {
  console.error(`File not found: ${resolvedXml}`)
  console.error("")
  console.error(
    '"path/to/JMdict_e.xml" in the docs is a placeholder — use the real path after you download the file.'
  )
  console.error(`Download: ${JMDICT_DOWNLOAD}`)
  console.error("")
  console.error('Example (PowerShell):')
  console.error(
    '  npm run ingest:jmdict -- "$env:USERPROFILE\\Downloads\\JMdict_e.xml"'
  )
  process.exit(1)
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!url || !serviceKey) {
  console.error(
    "Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before ingest."
  )
  process.exit(1)
}

async function main(): Promise<void> {
  const xml = readFileSync(resolvedXml, "utf-8")
  const entries = parseJmdictXml(xml)
  console.log(`Parsed ${entries.length} entries.`)

  if (!entries.length) {
    return
  }

  const supabase = createClient(url!, serviceKey!)
  const BATCH = 500
  let inserted = 0

  for (let i = 0; i < entries.length; i += BATCH) {
    const slice = entries.slice(i, i + BATCH)
    const rows = slice.map((e) => ({
      id: e.id,
      ent_seq: e.entSeq,
      japanese: e.japanese,
      reading: e.reading,
      meanings: e.meanings,
      romaji: e.romaji,
      jlpt: e.jlpt ?? null,
      frequency_tier: e.frequencyTier,
      search_text: buildSearchText(e),
    }))

    const { error } = await supabase.from("vocabulary_entries").upsert(rows, {
      onConflict: "id",
    })

    if (error) {
      console.error("Upsert failed:", error.message)
      process.exit(1)
    }

    inserted += rows.length
    console.log(`Upserted ${inserted} / ${entries.length}`)
  }

  console.log("Ingest complete.")
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
