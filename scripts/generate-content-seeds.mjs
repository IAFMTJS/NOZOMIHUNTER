#!/usr/bin/env node
/**
 * Generate Vol 10 content seeds at GDD scale (100+ contracts, 25+ archive, boss phases, achievements).
 */
import fs from "node:fs"
import path from "node:path"

const ROOT = process.cwd()
const SEEDS = path.join(ROOT, "content/seeds")

const SECTORS = [
  "neon-corridor",
  "shadow-archive",
  "void-sector",
  "abyss-core",
  "registry-hub",
]

const LEARNING = ["vocabulary", "listening", "grammar", "reading", "speaking", "kanji"]

const STORY_MODES = [
  "LOST_TRANSMISSION",
  "TERMINAL_BREACH",
  "GHOST_INTERROGATION",
  "DEEP_COVER",
  "SEMANTIC_NETWORK",
]

const SIDE_MODES = [
  "ENTITY_HUNT",
  "SEMANTIC_NETWORK",
  "TERMINAL_BREACH",
  "GHOST_INTERROGATION",
  "PANIC_CHANNEL",
  "KANJI_SURGERY",
  "SIGNAL_CALIBRATION",
  "MEMORY_CASCADE",
]

const DAILY_MODES = ["SIGNAL_CALIBRATION", "MEMORY_CASCADE", "KANA_DASH", "ECHO_LISTENING"]

function contractRow(channel, index, titlePrefix) {
  const sector = SECTORS[index % SECTORS.length]
  const focus = LEARNING[index % LEARNING.length]
  const modes =
    channel === "story" ? STORY_MODES : channel === "daily" ? DAILY_MODES : SIDE_MODES
  const mode = modes[index % modes.length]
  const tier = channel === "story" ? "MAIN" : channel === "daily" ? "DAILY" : "SIDE"
  return {
    id: `contract-${channel}-${String(index + 1).padStart(3, "0")}`,
    title: `${titlePrefix} ${index + 1}`,
    channel,
    template: {
      description: `Sector ${sector}: ${focus} anomaly containment protocol.`,
      briefing: `Registry dispatch — stabilize ${focus} signatures before bleed.`,
      type: index % 4 === 0 ? "CONVERSATION" : index % 4 === 1 ? "LISTENING" : "VOCABULARY",
      wordCount: 2 + (index % 5),
      narrativeTier: tier,
      gameMode: mode,
      minimumLevel: 1 + (index % 12),
      sector,
      learning_focus: focus,
      boss_connection: index % 3 === 0 ? `dungeon:${sector}` : null,
    },
  }
}

const storyContracts = Array.from({ length: 40 }, (_, i) =>
  contractRow("story", i, "Main arc")
)
const sideContracts = Array.from({ length: 40 }, (_, i) =>
  contractRow("side", i, "Whisper op")
)
const dailyContracts = Array.from({ length: 20 }, (_, i) =>
  contractRow("daily", i, "Daily sweep")
)

const contracts = [...storyContracts, ...sideContracts, ...dailyContracts]

const archiveExtras = [
  { id: "whisper-index", title: "Whisper index — fragment 0", teaser: "They recorded the corridor before the lights failed.", lore_excerpt: "…sector seven went dark at 03:12.", min_rank: null },
  { id: "corridor-zero", title: "Corridor zero manifest", teaser: "First breach log before the neon grid stabilized.", lore_excerpt: "Operator 7 marked corridor zero as expendable.", min_rank: null },
  { id: "neon-grid-failure", title: "Neon grid failure log", teaser: "First documented cascade in corridor seven.", lore_excerpt: "The grid tried to correct itself.", min_rank: null },
  { id: "operator-oath", title: "Operator oath — redacted", teaser: "Rank-gated discipline vows.", lore_excerpt: "I will not read forbidden glyphs aloud.", min_rank: "B" },
  { id: "void-priest-fragment", title: "Void priest fragment", teaser: "Recovered from abyss telemetry.", lore_excerpt: "The priest speaks in perfect grammar.", min_rank: "A" },
  { id: "fracture-week-memo", title: "Fracture week bulletin", teaser: "Season modifier broadcast.", lore_excerpt: "Corruption gain +15% until cycle ends.", min_rank: null },
  { id: "hunter-registry-alpha", title: "Registry alpha index", teaser: "Pre-collapse operator roster.", min_rank: null },
  { id: "semantic-collapse", title: "Semantic collapse report", teaser: "Entity hunt telemetry — sector 12.", lore_excerpt: "Words stopped meaning what they meant.", min_rank: "C" },
  { id: "panic-channel-log", title: "Panic channel intercept", teaser: "Emergency dialogue capture.", min_rank: "D" },
  { id: "relic-field-manual", title: "Relic field manual", teaser: "Equipment stacking rules.", min_rank: null },
  { id: "warden-phase-two", title: "Warden phase two transcript", teaser: "Boss integrity breach at 40%.", min_rank: "B" },
  { id: "extraction-oath", title: "Extraction ceremony oath", teaser: "Spoken at gate clear.", min_rank: "S" },
  { id: "mirror-hunter-echo", title: "Mirror hunter echo", teaser: "Void pursuit telemetry shard.", min_rank: "A" },
  { id: "collapse-run-loop", title: "Collapse run loop memo", teaser: "Endless sector recursion notes.", min_rank: "B" },
  { id: "broadcast-spirit", title: "Broadcast spirit hymn", teaser: "Roguelike sector chant.", min_rank: "C" },
  { id: "gate-devourer-seal", title: "Gate devourer seal rubbings", teaser: "Abyss core wall inscriptions.", min_rank: "A" },
  { id: "iris-routing-table", title: "Iris routing table", teaser: "Spectral NPC channel map.", min_rank: null },
  { id: "forbidden-kanji-chain", title: "Forbidden glyph chain", teaser: "Do not read aloud.", min_rank: "B", linked_contract_id: "story:shadow-archive-intro" },
  { id: "night-report", title: "Night operator report", teaser: "Time-gated fragment.", min_rank: null },
  { id: "discipline-oath-fragment", title: "Discipline oath fragment", teaser: "Registry maintenance vows.", min_rank: "B" },
  { id: "relic-index-field", title: "Relic index — field edition", teaser: "Equipment signatures.", min_rank: null },
  { id: "abyss-core-memo", title: "Abyss core breach memo", teaser: "Deep sector pressure.", min_rank: "A" },
  { id: "semantic-ghost-lattice", title: "Semantic ghost lattice", teaser: "Entity hunt overlay.", min_rank: null },
  { id: "warden-echo-transcript", title: "Warden echo transcript", teaser: "Boss phase whispers.", min_rank: "C" },
  { id: "void-cartography-shard", title: "Void cartography shard", teaser: "Unmapped coordinates.", min_rank: "A" },
]

function dedupeById(rows) {
  const map = new Map()
  for (const row of rows) map.set(row.id, row)
  return [...map.values()]
}

const archive = dedupeById(archiveExtras)

const DUNGEON_BOSSES = [
  { key: "dungeon:neon-corridor", name: "Neon Warden" },
  { key: "dungeon:shadow-archive", name: "Shadow Archivist" },
  { key: "dungeon:abyss-core", name: "Gate Devourer" },
  { key: "dungeon:corruption-run", name: "Collapse Echo" },
  { key: "dungeon:void-pursuit", name: "Mirror Hunter" },
  { key: "dungeon:roguelike-sector", name: "Broadcast Spirit" },
]

const bossPhases = []
for (const d of DUNGEON_BOSSES) {
  for (let p = 0; p < 3; p++) {
    const kinds = ["VOCAB", "LISTENING", "SPEECH"]
    bossPhases.push({
      id: `${d.key.replace("dungeon:", "")}-phase-${p}`,
      boss_key: d.key,
      phase_index: p,
      spec: {
        id: `phase-${p}`,
        label: `${d.name} — Phase ${p + 1}`,
        encounterKind: kinds[p % kinds.length],
        wordCount: 3 + p,
      },
    })
  }
}

const relics = [
  { item_key: "item:focus-lens", effect_type: "xp_mult", value: 0.05 },
  { item_key: "item:memory-core", effect_type: "stamina_regen", value: 1 },
  { item_key: "item:void-seal", effect_type: "corruption_resist", value: 5 },
  { item_key: "item:signal-cache", effect_type: "credits_bonus", value: 10 },
  { item_key: "item:shadow-shard", effect_type: "power_flat", value: 15 },
  { item_key: "item:stamina-brew", effect_type: "stamina_regen", value: 2 },
  { item_key: "item:corruption-ward", effect_type: "corruption_resist", value: 8 },
]

const achievements = [
  { id: "first-level", title: "Rank elevation", description: "Reach hunter level 2.", unlock_key: "level:2" },
  { id: "discipline-3", title: "Discipline chain", description: "Maintain synchronization 3 days.", unlock_key: "sync:3" },
  { id: "neon-clear", title: "Neon breach", description: "Unlock Neon Corridor.", unlock_key: "dungeon:neon-corridor" },
  { id: "abyss-clear", title: "Abyss breach", description: "Unlock Abyss Core.", unlock_key: "dungeon:abyss-core" },
  { id: "vocab-master", title: "Threat neutralized", description: "Earn vocabulary mastery title.", unlock_key: "title:mastery" },
  { id: "gatebreaker", title: "Gatebreaker", description: "Perfect clear Neon Warden.", unlock_key: "boss:neon-warden" },
  { id: "archive-breaker", title: "Archive Breaker", description: "Perfect clear Archivist.", unlock_key: "boss:archivist" },
  { id: "master-rival", title: "Rival bound", description: "Rival state with a master.", unlock_key: "master:rival" },
  ...Array.from({ length: 22 }, (_, i) => ({
    id: `gdd-achievement-${i + 9}`,
    title: `Registry mark ${i + 9}`,
    description: `Complete ${i + 5} sector operations.`,
    unlock_key: `ops:${i + 5}`,
  })),
]

fs.writeFileSync(path.join(SEEDS, "content-contracts.json"), JSON.stringify(contracts, null, 2))
fs.writeFileSync(path.join(SEEDS, "content-archive.json"), JSON.stringify(archive, null, 2))
fs.writeFileSync(path.join(SEEDS, "content-boss-phases.json"), JSON.stringify(bossPhases, null, 2))
fs.writeFileSync(path.join(SEEDS, "content-relic-effects.json"), JSON.stringify(relics, null, 2))
fs.writeFileSync(path.join(SEEDS, "content-achievements.json"), JSON.stringify(achievements, null, 2))
console.log(
  `[generate-content-seeds] ${contracts.length} contracts, ${archive.length} archive, ${bossPhases.length} boss phases, ${relics.length} relics, ${achievements.length} achievements`
)
