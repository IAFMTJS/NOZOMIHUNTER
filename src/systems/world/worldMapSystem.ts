import { DUNGEON_DEFINITIONS } from "@/config/dungeonConfig"
import type { PlayerContract } from "@/contracts/player-contract"

export interface WorldMapNode {
  key: string
  name: string
  locked: boolean
  corrupted: boolean
  href: string
  hint?: string
}

export function buildWorldMapNodes(player: PlayerContract | null): WorldMapNode[] {
  const unlocked = new Set(player?.progression.unlockedDungeons ?? [])
  return DUNGEON_DEFINITIONS.map((sector) => {
    const locked = player ? !unlocked.has(sector.key) : true
    const corrupted = sector.key.includes("corruption") || sector.key.includes("void")
    const slug = sector.key.replace(/^dungeon:/, "")
    return {
      key: sector.key,
      name: sector.name,
      locked,
      corrupted,
      href: locked ? "/dungeons" : `/dungeons/${encodeURIComponent(slug)}`,
      hint: locked ? "Signal locked — clear prior sectors" : undefined,
    }
  })
}
