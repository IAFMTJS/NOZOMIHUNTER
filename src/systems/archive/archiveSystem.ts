import type { PlayerContract } from "@/contracts/player-contract"

export interface ArchiveEntry {
  id: string
  title: string
  teaser: string
  /** Shown when entry is unlocked — full lore stub for future contracts. */
  loreExcerpt?: string
  locked: boolean
  lockReason?: string
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
    locked: false,
  },
  {
    id: "forbidden-kanji",
    title: "Forbidden glyph chain",
    teaser: "Do not read aloud unless your rank permits.",
    locked: true,
    lockReason: "Requires Shadow Archive sector clear",
    linkedContractId: "story:shadow-archive-intro",
  },
  {
    id: "night-report",
    title: "Night operator report",
    teaser: "Only visible after 22:00 local.",
    locked: true,
    lockReason: "Time-gated — return after neon dusk",
  },
  {
    id: "corridor-zero",
    title: "Corridor zero manifest",
    teaser: "First breach log before the neon grid stabilized.",
    loreExcerpt: "Operator 7 marked corridor zero as expendable. The grid disagreed.",
    locked: false,
  },
  {
    id: "iris-origin",
    title: "Iris channel origin",
    teaser: "Spectral routing table — partial decode.",
    locked: false,
  },
  {
    id: "warden-echo",
    title: "Warden echo transcript",
    teaser: "Boss phase whispers captured during Shadow Archive run.",
    locked: true,
    lockReason: "Clear Shadow Archive warden encounter",
  },
  {
    id: "void-cartography",
    title: "Void cartography shard",
    teaser: "Unmapped sector coordinates leak through static.",
    locked: true,
    lockReason: "Requires Void sector access",
  },
  {
    id: "discipline-oath",
    title: "Discipline oath fragment",
    teaser: "Registry maintenance vows — rank B minimum.",
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

export function listArchiveEntries(player: PlayerContract | null): ArchiveEntry[] {
  const shadowClear = player?.progression.unlockedDungeons.includes(
    "dungeon:shadow-archive"
  )
  const hour = new Date().getHours()
  const nightOk = hour >= 22 || hour < 5

  return mergedEntries().map((e) => {
    if (e.id === "forbidden-kanji") {
      return { ...e, locked: !shadowClear, lockReason: shadowClear ? undefined : e.lockReason }
    }
    if (e.id === "night-report") {
      return { ...e, locked: !nightOk, lockReason: nightOk ? undefined : e.lockReason }
    }
    return e
  })
}
