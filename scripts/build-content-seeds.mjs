#!/usr/bin/env node
/** Build story beats, encounter scripts, and expanded archive seeds from Season 1 pack. */
import fs from "node:fs"
import path from "node:path"

const ROOT = process.cwd()
const SEEDS = path.join(ROOT, "content/seeds")
const storyPath = path.join(
  ROOT,
  "content/seasons/season-01-broken-signal/story-missions.json"
)

const story = JSON.parse(fs.readFileSync(storyPath, "utf8"))

const storyBeats = story.missions.map((m) => ({
  id: m.storyBeatId,
  season_id: story.seasonId,
  chapter_id: m.chapterId,
  mission_index: m.missionIndex,
  title: m.title,
  prerequisite_beat_id: m.template.prerequisiteBeatId ?? null,
  metadata: {
    titleJa: m.titleJa,
    missionId: m.id,
    linkedSectorId: m.template.linkedSectorId ?? null,
  },
}))

fs.writeFileSync(
  path.join(SEEDS, "content-story-beats.json"),
  JSON.stringify(storyBeats, null, 2)
)

const encounterScripts = [
  {
    id: "neon-hall-vocab",
    sector_id: "sector-02",
    dungeon_key: "dungeon:neon-corridor",
    node_id: "neon-hall",
    script: {
      roomType: "COMBAT",
      gameMode: "TERMINAL_BREACH",
      briefing: "Neon Hall — terminal breach protocol.",
      phases: [
        { type: "ENVIRONMENT_SCAN", label: "Scanning neon signage…" },
        { type: "MODE_SEGMENT", gameMode: "TERMINAL_BREACH", wordCount: 3 },
      ],
    },
  },
  {
    id: "archive-door-listen",
    sector_id: "sector-02",
    dungeon_key: "dungeon:neon-corridor",
    node_id: "archive-door",
    script: {
      roomType: "ELITE",
      gameMode: "LOST_TRANSMISSION",
      phases: [
        { type: "ENVIRONMENT_SCAN", label: "Signal distortion rising…" },
        { type: "MODE_SEGMENT", gameMode: "LOST_TRANSMISSION", fragmentCount: 2 },
      ],
    },
  },
  {
    id: "signal-hall-npc",
    sector_id: "sector-02",
    dungeon_key: "dungeon:neon-corridor",
    node_id: "signal-hall",
    script: {
      roomType: "COMBAT",
      gameMode: "GHOST_INTERROGATION",
      phases: [
        { type: "NPC_BRANCH", scenarioId: "signal-relay", label: "Hostile relay" },
        { type: "MODE_SEGMENT", gameMode: "GHOST_INTERROGATION" },
      ],
    },
  },
  {
    id: "story-rest-shrine",
    sector_id: "sector-02",
    dungeon_key: "dungeon:neon-corridor",
    node_id: "recovery-alcove",
    script: {
      roomType: "RECOVERY",
      briefing: "Recovery alcove — sector pressure eases.",
      phases: [{ type: "STORY_BEAT", label: "Stabilization pulse" }],
    },
  },
  {
    id: "listening-vault",
    sector_id: "sector-03",
    dungeon_key: "dungeon:shadow-archive",
    node_id: "listening-vault",
    script: {
      roomType: "COMBAT",
      gameMode: "LOST_TRANSMISSION",
      phases: [{ type: "MODE_SEGMENT", gameMode: "LOST_TRANSMISSION", fragmentCount: 2 }],
    },
  },
  {
    id: "lexicon-stack",
    sector_id: "sector-03",
    dungeon_key: "dungeon:shadow-archive",
    node_id: "lexicon-stack",
    script: {
      roomType: "ELITE",
      gameMode: "MEMORY_CASCADE",
      phases: [{ type: "MODE_SEGMENT", gameMode: "MEMORY_CASCADE", wordCount: 4 }],
    },
  },
  {
    id: "story-whisper",
    sector_id: "sector-03",
    dungeon_key: "dungeon:shadow-archive",
    node_id: "story-fragment",
    script: {
      roomType: "STORY",
      storyBeatId: "beat-s01-019",
      phases: [
        {
          type: "STORY_BEAT",
          label: "Archive whisper — partial decode",
          scenarioId: "shadow-briefing",
        },
      ],
    },
  },
  {
    id: "abyss-vocab",
    sector_id: "sector-04",
    dungeon_key: "dungeon:abyss-core",
    node_id: "vocab",
    script: {
      gameMode: "SURVIVAL_VOCAB",
      phases: [{ type: "MODE_SEGMENT", gameMode: "SURVIVAL_VOCAB", wordCount: 4 }],
    },
  },
  {
    id: "void-listen",
    sector_id: "sector-04",
    dungeon_key: "dungeon:void-pursuit",
    node_id: "listen",
    script: {
      gameMode: "LOST_TRANSMISSION",
      phases: [{ type: "MODE_SEGMENT", gameMode: "LOST_TRANSMISSION", fragmentCount: 3 }],
    },
  },
]

fs.writeFileSync(
  path.join(SEEDS, "content-encounter-scripts.json"),
  JSON.stringify(encounterScripts, null, 2)
)

const JA = [
  "セクター七は03:12に消えた",
  "第一の文字はまだ息をしている",
  "静かな祈りが記録に残る",
  "アイリスは嘘をつかない——省略する",
  "寺院の信号は歪んでいる",
  "忘れられた名を呼べ",
  "記録を復元せよ",
  "虚ろの門が開く",
  "歪んだ放送が届く",
  "ネオン回廊に侵入",
  "オペレーター七は生きている",
  "緊急送信——応答なし",
  "回廊突破の許可",
  "監視者は二度目を待つ",
  "静止した告白",
  "信号の冠",
  "語彙の負債",
  "記録官と接触",
  "記憶保管庫の鍵",
  "影の突破",
  "禁断索引",
  "真実は日本語で書かれている",
  "深淵探査ログ",
  "壊れた信号——最終章",
]

const EXTRA_FRAGMENTS = [
  ["hunter-oath-e", "Hunter oath — rank E", "Registry induction vows.", null, "beat-s01-001", "ハンター誓約"],
  ["glyph-resonance", "Glyph resonance chart", "First alphabet harmonics.", "story-s01-m02", "beat-s01-002", "共鳴の文字"],
  ["temple-static", "Temple static sample", "Prayer line under noise.", "story-s01-m03", "beat-s01-003", "寺院の雑音"],
  ["iris-handshake", "Iris handshake log", "Trust channel opened.", "story-s01-m04", "beat-s01-004", "信頼ハンドシェイク"],
  ["forgotten-prayer", "Forgotten prayer reel", "Names erased from registry.", "story-s01-m06", "beat-s01-006", "消された祈り"],
  ["kanji-surgery-note", "Kanji surgery note", "Restoration incisions.", "story-s01-m07", "beat-s01-007", "文字修復記録"],
  ["hollow-monk-whisper", "Hollow Monk whisper", "Gate guardian foreshadow.", "story-s01-m08", "beat-s01-008", "虚ろ僧の囁き"],
  ["broadcast-fragment", "Broadcast fragment 7", "Distorted carrier wave.", "story-s01-m09", "beat-s01-009", "放送断片"],
  ["neon-infiltration-brief", "Neon infil brief", "Corridor seven map.", "story-s01-m10", "beat-s01-010", "潜入指令"],
  ["operator-seven-memo", "Operator Seven memo", "Panic channel excerpt.", "story-s01-m11", "beat-s01-011", "七番の覚書"],
  ["emergency-transcript", "Emergency transcript", "Speech relay failure.", "story-s01-m12", "beat-s01-012", "緊急通話記録"],
  ["corridor-breach-log", "Corridor breach log", "Neon corridor deploy.", "story-s01-m13", "beat-s01-013", "回廊突破記録"],
  ["warden-rematch-telemetry", "Warden rematch telemetry", "Phase integrity dips.", "story-s01-m14", "beat-s01-014", "監視者再戦データ"],
  ["static-confession-clip", "Static confession clip", "Iris omits a name.", "story-s01-m15", "beat-s01-015", "静止告白"],
  ["signal-crown-rubric", "Signal crown rubric", "Survival vocab crown.", "story-s01-m16", "beat-s01-016", "信号の冠"],
  ["lexicon-debt-ledger", "Lexicon debt ledger", "Memory cascade IOU.", "story-s01-m17", "beat-s01-017", "語彙負債台帳"],
  ["archivist-contact", "Archivist contact sheet", "Shadow briefing stub.", "story-s01-m18", "beat-s01-018", "記録官連絡"],
  ["memory-vault-key", "Memory vault key", "Listening vault access.", "story-s01-m19", "beat-s01-019", "記憶保管庫"],
  ["shadow-breach-report", "Shadow breach report", "Archivist boss aftermath.", "story-s01-m20", "beat-s01-020", "影突破報告"],
  ["forbidden-index-page", "Forbidden index page", "Entity hunt index.", "story-s01-m21", "beat-s01-021", "禁断索引"],
  ["iris-truth-fragment", "Iris truth fragment", "Lie by omission decoded.", "story-s01-m22", "beat-s01-022", "真実の断片"],
  ["abyss-probe-data", "Abyss probe data", "Void priest telemetry.", "story-s01-m23", "beat-s01-023", "深淵探査"],
  ["finale-oath-echo", "Finale oath echo", "Broken signal closure.", "story-s01-m24", "beat-s01-024", "最終誓約"],
  ["side-distorted-broadcast", "Side — distorted broadcast", "Anomaly side contract lore.", null, null, "歪んだ放送"],
  ["side-broken-meanings", "Side — broken meanings", "Semantic drift field notes.", null, null, "壊れた意味"],
  ["side-neon-drift", "Side — neon drift", "Corridor drift memo.", null, "beat-s01-010", "ネオンドリフト"],
  ["side-registry-echo", "Side — registry echo", "Duplicate hunter IDs.", null, "beat-s01-005", "レジストリ反響"],
  ["side-whisper-cache", "Side — whisper cache", "Cached whispers pre-purge.", null, "beat-s01-004", "囁きキャッシュ"],
]

const existingPath = path.join(SEEDS, "content-archive.json")
const existing = fs.existsSync(existingPath)
  ? JSON.parse(fs.readFileSync(existingPath, "utf8"))
  : []

const beatMissionMap = new Map(
  story.missions
    .filter((m) => m.template.archiveUnlockId)
    .map((m) => [m.template.archiveUnlockId, m])
)

const coreArchive = story.missions
  .filter((m) => m.template.archiveUnlockId)
  .map((m, i) => ({
    id: m.template.archiveUnlockId,
    title: `${m.title} — archive shard`,
    teaser: `Recovered during ${m.title}.`,
    lore_excerpt: m.template.description ?? m.title,
    min_rank: null,
    linked_contract_id: m.id,
    required_beat_id: m.storyBeatId,
    japanese_excerpt: m.titleJa ?? JA[i % JA.length],
  }))

const extras = EXTRA_FRAGMENTS.map(
  ([id, title, teaser, contractId, beatId, ja]) => ({
    id,
    title,
    teaser,
    lore_excerpt: teaser,
    min_rank: null,
    linked_contract_id: contractId,
    required_beat_id: beatId,
    japanese_excerpt: ja,
  })
)

const keepIds = new Set([...coreArchive, ...extras].map((e) => e.id))
const kept = existing.filter((e) => !keepIds.has(e.id))
const archive = [...kept, ...coreArchive, ...extras]

fs.writeFileSync(
  path.join(SEEDS, "content-archive.json"),
  JSON.stringify(archive, null, 2)
)

console.log(
  `[build-content-seeds] beats=${storyBeats.length} scripts=${encounterScripts.length} archive=${archive.length}`
)
