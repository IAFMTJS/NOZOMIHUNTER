import { describe, expect, it } from "vitest"
import {
  applyBossDamage,
  bossVitalityCurrent,
  initBossVitality,
} from "@/systems/dungeons/bossVitalitySystem"
import type { DungeonRunContract } from "@/contracts/dungeon-contract"

const baseRun = (): DungeonRunContract =>
  ({
    dungeon: { id: "d1", name: "Test", encounters: [] } as unknown as DungeonRunContract["dungeon"],
    machineState: "BOSS",
    currentEncounterIndex: 0,
    activeType: "BOSS",
    encounterFailures: 0,
    bossPhase: 0,
  }) as DungeonRunContract

describe("bossVitalitySystem", () => {
  it("initializes boss HP from max", () => {
    const run = initBossVitality(baseRun())
    expect(bossVitalityCurrent(run)).toBeGreaterThan(0)
  })

  it("reduces HP on damage", () => {
    const run = initBossVitality(baseRun())
    const after = applyBossDamage(run, 25)
    expect(bossVitalityCurrent(after)).toBeLessThan(bossVitalityCurrent(run))
  })
})
