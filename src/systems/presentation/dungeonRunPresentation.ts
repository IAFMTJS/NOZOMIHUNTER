import type { DungeonRunContract } from "@/contracts/dungeon-contract"
import { NEON_CORRIDOR_FORECAST } from "@/config/neonCorridorV2Config"
import { getCurrentNode } from "@/systems/dungeons/dungeonRouteSystem"

export function buildEntryBriefing(
  run: DungeonRunContract,
  baseDescription: string
): string {
  const boss = run.dungeon.boss?.name ?? "Unknown"
  const warnings = NEON_CORRIDOR_FORECAST.join(" · ")
  return `${baseDescription} · Boss: ${boss} · ${warnings}`
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
