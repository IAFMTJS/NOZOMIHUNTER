import type { DungeonBossPhaseSpec } from "@/contracts/dungeon-contract"

const phasesByBoss = new Map<string, DungeonBossPhaseSpec[]>()

export function setBossPhasesFromDb(
  rows: { boss_key: string; phase_index: number; spec: DungeonBossPhaseSpec }[]
): void {
  phasesByBoss.clear()
  for (const row of rows) {
    const list = phasesByBoss.get(row.boss_key) ?? []
    list[row.phase_index] = row.spec
    phasesByBoss.set(row.boss_key, list)
  }
}

/** DB phases override static dungeon config when ingested. */
export function resolveBossPhaseSpecs(
  bossKey: string,
  fallback?: DungeonBossPhaseSpec[]
): DungeonBossPhaseSpec[] | undefined {
  const fromDb = phasesByBoss.get(bossKey)?.filter(Boolean)
  if (fromDb?.length) return fromDb
  return fallback
}
