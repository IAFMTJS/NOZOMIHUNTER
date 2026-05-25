import type { DungeonRunContract } from "@/contracts/dungeon-contract"
import { NEON_CORRIDOR_FORECAST } from "@/config/neonCorridorV2Config"
import { SHADOW_ARCHIVE_FORECAST } from "@/config/shadowArchiveV2Config"
import { resolveMasterForRun } from "@/systems/dungeons/dungeonMasterSystem"
import { getCurrentNode } from "@/systems/dungeons/dungeonRouteSystem"

export function buildEntryBriefing(
  run: DungeonRunContract,
  baseDescription: string
): string {
  const master = resolveMasterForRun(run)
  const warnings =
    master.id === "archivist"
      ? SHADOW_ARCHIVE_FORECAST.join(" · ")
      : NEON_CORRIDOR_FORECAST.join(" · ")
  return `${baseDescription} · ${master.displayName} · ${warnings}`
}

export function sectorDangerClass(danger: string | undefined): string {
  switch (danger) {
    case "high":
      return "nozomi-dungeon-danger-high"
    case "medium":
      return "nozomi-dungeon-danger-medium"
    default:
      return "nozomi-dungeon-danger-low"
  }
}

export function currentSectorTitle(run: DungeonRunContract): string {
  const node = getCurrentNode(run)
  return node?.label ?? run.dungeon.name
}
