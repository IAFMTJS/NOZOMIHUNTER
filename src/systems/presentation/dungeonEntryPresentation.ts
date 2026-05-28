import type { DungeonDefinitionConfig } from "@/config/dungeonConfig"

export interface DungeonEntryTensionCopy {
  signalLine: string
  corruptionLabel: string
  corruptionPercent: number
}

/** Briefing tension for sector detail — corruption scales with sector depth. */
export function buildDungeonEntryTension(
  def: DungeonDefinitionConfig
): DungeonEntryTensionCopy {
  const depth = def.encounterPlan.length
  const corruptionPercent = Math.min(95, 28 + depth * 9 + Math.floor(def.minLevel / 2))
  const signalLine =
    depth >= 4
      ? "Deep-band interference — expect archive bleed on scans."
      : depth >= 2
        ? "Elevated static on the corridor grid."
        : "Perimeter signal stable — corruption still climbing."

  return {
    signalLine,
    corruptionLabel: "Sector corruption index",
    corruptionPercent,
  }
}
