/**
 * Run with: npx tsx scripts/ingest-jmdict.ts <path-to-jmdict.xml>
 * Ingests parsed entries into Supabase (implement when JMDict file is available).
 */
import { parseJmdictXmlStub } from "../src/services/jmdict/parser"
import { readFileSync } from "fs"

const path = process.argv[2]
if (!path) {
  console.log("Usage: npx tsx scripts/ingest-jmdict.ts <jmdict.xml>")
  process.exit(1)
}

const xml = readFileSync(path, "utf-8")
const entries = parseJmdictXmlStub(xml)
console.log(`Parsed ${entries.length} entries (stub). Wire Supabase insert here.`)
