#!/usr/bin/env node
/**
 * Validates Season 1 content pack — fails on procedural "Main arc N" story titles.
 */
import fs from "node:fs"
import path from "node:path"

const ROOT = process.cwd()
let errors = 0

function fail(msg) {
  console.error(`[validate:content] ${msg}`)
  errors += 1
}

function readJson(rel) {
  const p = path.join(ROOT, rel)
  if (!fs.existsSync(p)) return null
  return JSON.parse(fs.readFileSync(p, "utf8"))
}

const contracts = readJson("content/seeds/content-contracts.json")
if (Array.isArray(contracts)) {
  for (const c of contracts) {
    if (c.channel === "story" && /^Main arc \d+$/i.test(c.title ?? "")) {
      fail(`Procedural story title still present: ${c.id} "${c.title}"`)
    }
  }
}

const storyMissions = readJson(
  "content/seasons/season-01-broken-signal/story-missions.json"
)
if (!storyMissions?.missions?.length) {
  fail("Missing content/seasons/season-01-broken-signal/story-missions.json")
} else {
  const ids = new Set()
  for (const m of storyMissions.missions) {
    if (!m.id || !m.storyBeatId) fail(`Mission missing id or storyBeatId`)
    if (ids.has(m.id)) fail(`Duplicate mission id ${m.id}`)
    ids.add(m.id)
    if (m.prerequisiteBeatId && !ids.has(`beat:${m.prerequisiteBeatId}`)) {
      /* beat refs validated in second pass */
    }
  }
  const beatIds = new Set(storyMissions.missions.map((m) => m.storyBeatId))
  for (const m of storyMissions.missions) {
    if (m.prerequisiteBeatId && !beatIds.has(m.prerequisiteBeatId)) {
      fail(`${m.id}: unknown prerequisiteBeatId ${m.prerequisiteBeatId}`)
    }
  }
}

const arc = readJson("content/seasons/season-01-broken-signal/arc.json")
if (!arc?.seasonId) fail("Missing arc.json seasonId")

if (errors > 0) {
  console.error(`[validate:content] FAILED with ${errors} error(s)`)
  process.exit(1)
}
console.log("[validate:content] OK")
