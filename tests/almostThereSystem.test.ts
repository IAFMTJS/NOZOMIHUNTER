import { describe, expect, it } from "vitest"
import {
  buildAlmostThereObjective,
  rankProgressPercent,
  nextRankAfter,
} from "@/systems/progression/almostThereSystem"
import type { PlayerContract } from "@/contracts/player-contract"
import { defaultProgression } from "@/systems/progression/unlockSystem"

function mockPlayer(overrides: Partial<PlayerContract> = {}): PlayerContract {
  return {
    id: "00000000-0000-4000-8000-000000000001",
    username: "test",
    identity: { codename: "Void Diver", registryId: "HN-0001" },
    synchronization: {
      chainDays: 2,
      lastActiveDate: "2026-05-28",
      status: "STABLE",
      atRisk: false,
    },
    level: 8,
    xp: 500,
    rank: "E",
    stats: {
      vocabulary: 10,
      grammar: 10,
      listening: 10,
      speaking: 10,
      confidence: 10,
      intelligence: 10,
      consistency: 10,
    },
    rpgStats: { strength: 10, agility: 10, intelligence: 12, vitality: 10 },
    penalties: { corruption: 12, fatigue: 0, xpDebt: 0 },
    progression: defaultProgression(),
    economy: {
      credits: 0,
      stamina: 10,
      staminaMax: 10,
      brewTokens: 0,
      activeBoosts: [],
      xpConversionCount: 0,
      xpConversionDate: null,
    },
    inventory: [],
    trackedQuestId: null,
    pendingRewards: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  }
}

describe("almostThereSystem", () => {
  it("resolves next rank after E as D", () => {
    expect(nextRankAfter("E")).toBe("D")
  })

  it("computes rank progress percent between thresholds", () => {
    expect(rankProgressPercent(8, "E")).toBeGreaterThan(0)
    expect(rankProgressPercent(8, "E")).toBeLessThan(100)
  })

  it("builds rank objective for mid-level hunters", () => {
    const vm = buildAlmostThereObjective(mockPlayer({ level: 8 }), [])
    expect(vm.title).toContain("Rank D")
    expect(vm.progressPercent).toBeGreaterThan(0)
  })
})
