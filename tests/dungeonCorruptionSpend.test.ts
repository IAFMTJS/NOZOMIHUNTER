import { describe, expect, it } from "vitest"
import {
  applyCorruptionSpendIntelRoute,
  canSpendCorruptionForRoute,
} from "@/systems/dungeons/dungeonThreatSystem"
import type { DungeonRunContract } from "@/contracts/dungeon-contract"

const baseRun = {
  dungeon: { id: "dungeon:test" },
} as unknown as DungeonRunContract

describe("dungeonThreatSystem corruption spend", () => {
  it("requires minimum corruption to spend on risky routes", () => {
    expect(canSpendCorruptionForRoute(9)).toBe(false)
    expect(canSpendCorruptionForRoute(10)).toBe(true)
  })

  it("grants route intel when corruption is spent", () => {
    const next = applyCorruptionSpendIntelRoute(baseRun, 10)
    expect(next.routeIntel).toContain("sector intel")
  })
})
