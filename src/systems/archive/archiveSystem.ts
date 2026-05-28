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
]

export function listArchiveEntries(player: PlayerContract | null): ArchiveEntry[] {
  const shadowClear = player?.progression.unlockedDungeons.includes(
    "dungeon:shadow-archive"
  )
  const hour = new Date().getHours()
  const nightOk = hour >= 22 || hour < 5

  return ENTRIES.map((e) => {
    if (e.id === "forbidden-kanji") {
      return { ...e, locked: !shadowClear, lockReason: shadowClear ? undefined : e.lockReason }
    }
    if (e.id === "night-report") {
      return { ...e, locked: !nightOk, lockReason: nightOk ? undefined : e.lockReason }
    }
    return e
  })
}
