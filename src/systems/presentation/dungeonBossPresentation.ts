import type { DungeonBossPhaseSpec } from "@/contracts/dungeon-contract"

export function bossPhaseBannerCopy(
  bossName: string,
  spec: DungeonBossPhaseSpec | null,
  phaseIndex: number,
  totalPhases: number
): string {
  const label = spec?.label ?? `Phase ${phaseIndex + 1}`
  return `${bossName} — ${label} (${phaseIndex + 1}/${totalPhases})`
}
