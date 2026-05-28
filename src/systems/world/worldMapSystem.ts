import { DUNGEON_DEFINITIONS } from "@/config/dungeonConfig"
import type { PlayerContract } from "@/contracts/player-contract"

export interface WorldMapNode {
  key: string
  name: string
  locked: boolean
  corrupted: boolean
  /** 0–100 presentation index for sector bleed on the map. */
  corruptionIndex: number
  href: string
  hint?: string
}

function sectorCorruptionIndex(
  sectorKey: string,
  playerCorruption: number,
  locked: boolean
): number {
  const base =
    sectorKey.includes("shadow") || sectorKey.includes("void") ? 42 : 18
  const playerBleed = Math.min(40, Math.floor(playerCorruption / 3))
  const lockPenalty = locked ? 12 : 0
  return Math.min(100, base + playerBleed + lockPenalty)
}

export function buildWorldMapNodes(player: PlayerContract | null): WorldMapNode[] {
  const unlocked = new Set(player?.progression.unlockedDungeons ?? [])
  const playerCorruption = player?.penalties.corruption ?? 0
  return DUNGEON_DEFINITIONS.map((sector) => {
    const locked = player ? !unlocked.has(sector.key) : true
    const corruptionIndex = sectorCorruptionIndex(
      sector.key,
      playerCorruption,
      locked
    )
    const corrupted =
      corruptionIndex >= 55 ||
      sector.key.includes("corruption") ||
      sector.key.includes("void")
    const slug = sector.key.replace(/^dungeon:/, "")
    return {
      key: sector.key,
      name: sector.name,
      locked,
      corrupted,
      corruptionIndex,
      href: locked ? "/dungeons" : `/dungeons/${encodeURIComponent(slug)}`,
      hint: locked
        ? "Signal locked — clear prior sectors"
        : corrupted
          ? `Corruption bleed ${corruptionIndex}% — expect archive fog`
          : undefined,
    }
  })
}
