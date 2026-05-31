import type { PlayerContract } from "@/contracts/player-contract"
import {
  isBeatCompleted,
  resolveStoryProgress,
} from "@/systems/narrative/storyProgressSystem"
import { canParseFragment } from "@/systems/narrative/japaneseKeySystem"

export interface ArchiveEntry {
  id: string
  title: string
  teaser: string
  /** Shown when entry is unlocked — full lore stub for future contracts. */
  loreExcerpt?: string
  /** Partial Japanese line — comprehension gate for locked teasers. */
  japaneseExcerpt?: string
  locked: boolean
  lockReason?: string
  /** Story beat that must be complete before this fragment opens. */
  requiredBeatId?: string
  /** Future: contract id that unlocks deeper read. */
  linkedContractId?: string
}

let dbArchiveEntries: ArchiveEntry[] | null = null

/** Merges DB rows from ingest over in-memory fallbacks (by id). */
export function setArchiveEntriesFromDb(rows: ArchiveEntry[]): void {
  dbArchiveEntries = rows
}

const ENTRIES: ArchiveEntry[] = [
  {
    id: "whisper-index",
    title: "Whisper index — fragment 0",
    teaser: "They recorded the corridor before the lights failed.",
    loreExcerpt:
      "…sector seven went dark at 03:12. The whisper index was the only file that survived the purge.",
    japaneseExcerpt: "セクター七は03:12に消えた",
    requiredBeatId: "beat-s01-004",
    locked: true,
    lockReason: "Complete Iris Briefing to decode",
    linkedContractId: "story-s01-m04",
  },
  {
    id: "forbidden-kanji",
    title: "Forbidden glyph chain",
    teaser: "Do not read aloud unless your rank permits.",
    japaneseExcerpt: "禁断の文字列",
    locked: true,
    lockReason: "Requires Shadow Archive sector clear",
    linkedContractId: "story-s01-m21",
  },
  {
    id: "night-report",
    title: "Night operator report",
    teaser: "Only visible after 22:00 local.",
    japaneseExcerpt: "夜間報告——未送信",
    locked: true,
    lockReason: "Time-gated — return after neon dusk",
    linkedContractId: "daily:night-scan",
  },
  {
    id: "corridor-zero",
    title: "Corridor zero manifest",
    teaser: "First breach log before the neon grid stabilized.",
    loreExcerpt: "Operator 7 marked corridor zero as expendable. The grid disagreed.",
    japaneseExcerpt: "第一の文字はまだ息をしている",
    requiredBeatId: "beat-s01-002",
    locked: true,
    lockReason: "Complete First Glyph",
    linkedContractId: "story-s01-m02",
  },
  {
    id: "iris-origin",
    title: "Iris channel origin",
    teaser: "Spectral routing table — partial decode.",
    japaneseExcerpt: "アイリス経路表",
    locked: false,
  },
  {
    id: "warden-echo",
    title: "Warden echo transcript",
    teaser: "Boss phase whispers captured during Shadow Archive run.",
    japaneseExcerpt: "監視者の囁き",
    locked: true,
    lockReason: "Clear Shadow Archive warden encounter",
  },
  {
    id: "void-cartography",
    title: "Void cartography shard",
    teaser: "Unmapped sector coordinates leak through static.",
    japaneseExcerpt: "空白地図の欠片",
    locked: true,
    lockReason: "Requires Void sector access",
  },
  {
    id: "discipline-oath",
    title: "Discipline oath fragment",
    teaser: "Registry maintenance vows — rank B minimum.",
    japaneseExcerpt: "規律誓約",
    locked: true,
    lockReason: "Reach rank B",
  },
  {
    id: "relic-index",
    title: "Relic index — field edition",
    teaser: "Equipment signatures catalogued from extractions.",
    locked: false,
  },
  {
    id: "abyss-core",
    title: "Abyss core breach memo",
    teaser: "Deep sector pressure readings — classified.",
    japaneseExcerpt: "深淵コア圧力",
    locked: true,
    lockReason: "Unlock Abyss Core sector",
  },
  {
    id: "semantic-ghost",
    title: "Semantic ghost lattice",
    teaser: "Entity hunt telemetry overlaid on vocabulary graph.",
    locked: false,
  },
]

function mergedEntries(): ArchiveEntry[] {
  if (!dbArchiveEntries?.length) return ENTRIES
  const byId = new Map(ENTRIES.map((e) => [e.id, e]))
  for (const row of dbArchiveEntries) {
    const existing = byId.get(row.id)
    byId.set(row.id, existing ? { ...existing, ...row } : row)
  }
  return [...byId.values()]
}

function isArchiveUnlocked(player: PlayerContract | null, entry: ArchiveEntry): boolean {
  if (!player) return false
  const progress = resolveStoryProgress(player)
  if (progress.archiveUnlockedIds.includes(entry.id)) return true
  if (entry.requiredBeatId && isBeatCompleted(progress, entry.requiredBeatId)) return true
  return false
}

export function listArchiveEntries(player: PlayerContract | null): ArchiveEntry[] {
  const shadowClear = player?.progression.unlockedDungeons.includes(
    "dungeon:shadow-archive"
  )
  const hour = new Date().getHours()
  const nightOk = hour >= 22 || hour < 5

  return mergedEntries().map((entry) => {
    let locked = entry.locked
    let lockReason = entry.lockReason

    if (entry.requiredBeatId && player) {
      const beatOpen = isArchiveUnlocked(player, entry)
      if (!beatOpen) {
        locked = true
        lockReason = lockReason ?? "Story beat incomplete"
      } else {
        locked = false
        lockReason = undefined
      }
    }

    if (entry.id === "forbidden-kanji" || entry.id === "forbidden-kanji-chain") {
      locked = !shadowClear
      lockReason = shadowClear ? undefined : (lockReason ?? "Requires Shadow Archive sector clear")
    }
    if (entry.id === "night-report") {
      const beatUnlocked =
        player &&
        entry.requiredBeatId &&
        isBeatCompleted(resolveStoryProgress(player), entry.requiredBeatId)
      if (!nightOk && !beatUnlocked) {
        locked = true
        lockReason = lockReason ?? "Time-gated — return after neon dusk"
      } else if (beatUnlocked || nightOk) {
        locked = false
        lockReason = undefined
      }
    }

    if (player && entry.japaneseExcerpt && locked) {
      const gate = canParseFragment(player, entry.japaneseExcerpt)
      if (!gate.allowed && gate.reason) {
        lockReason = gate.reason
      }
    }

    return { ...entry, locked, lockReason }
  })
}
