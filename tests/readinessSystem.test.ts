import { describe, expect, it } from "vitest"
import { computeReadiness } from "@/systems/readiness/readinessSystem"
import type { PlayerContract } from "@/contracts/player-contract"
import { defaultEconomy } from "@/systems/economy/staminaSystem"

function basePlayer(overrides: Partial<PlayerContract> = {}): PlayerContract {
  return {
    id: "00000000-0000-4000-8000-000000000001",
    username: "Hunter",
    xp: 0,
    level: 1,
    rank: "E",
    stats: {
      vocabulary: 50,
      grammar: 50,
      listening: 50,
      speaking: 50,
      confidence: 50,
      intelligence: 50,
      consistency: 50,
    },
    penalties: { corruption: 0, fatigue: 0, xpDebt: 0 },
    progression: {
      unlockedSystems: ["quests", "home"],
      unlockedDungeons: [],
      titles: [],
    },
    economy: defaultEconomy(),
    inventory: [],
    trackedQuestId: null,
    pendingRewards: null,
    synchronization: {
      chainDays: 0,
      lastActiveDate: null,
      status: "DORMANT",
      atRisk: false,
    },
    identity: { codename: "Echo", registryId: "HN-0001" },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  }
}

describe("computeReadiness", () => {
  it("returns OPTIMAL band for healthy player", () => {
    const result = computeReadiness({ player: basePlayer() })
    expect(result.survivalBand).toBe("OPTIMAL")
    expect(result.preparationScore).toBeGreaterThan(70)
  })

  it("returns CRITICAL when corruption is high", () => {
    const result = computeReadiness({
      player: basePlayer({
        penalties: { corruption: 90, fatigue: 0, xpDebt: 0 },
      }),
    })
    expect(result.survivalBand).toBe("CRITICAL")
  })
})
