import { describe, expect, it } from "vitest"
import {
  applyLevelUpDelta,
  deriveRpgStatsFromProgress,
  resolveRpgStats,
} from "@/systems/progression/rpgStatsSystem"
import { computeHunterPower } from "@/systems/power/hunterPowerSystem"
import type { PlayerContract } from "@/contracts/player-contract"
import { defaultEconomy } from "@/systems/economy/staminaSystem"

function basePlayer(overrides: Partial<PlayerContract> = {}): PlayerContract {
  const level = overrides.level ?? 5
  const rank = overrides.rank ?? "D"
  return {
    id: "00000000-0000-4000-8000-000000000001",
    username: "Hunter",
    xp: 0,
    level,
    rank,
    rpgStats:
      overrides.rpgStats ?? deriveRpgStatsFromProgress(level, rank),
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

describe("rpgStatsSystem", () => {
  it("derives stats from level", () => {
    const stats = deriveRpgStatsFromProgress(10, "C")
    expect(stats.strength).toBeGreaterThan(8)
    expect(stats.intelligence).toBeGreaterThan(stats.strength)
  })

  it("applies level-up delta", () => {
    const before = deriveRpgStatsFromProgress(5, "D")
    const after = applyLevelUpDelta(before, 2, "D")
    expect(after.strength).toBeGreaterThan(before.strength)
  })

  it("resolves stored stats when present", () => {
    const resolved = resolveRpgStats(5, "D", {
      strength: 99,
      agility: 88,
      intelligence: 77,
      vitality: 66,
    })
    expect(resolved.strength).toBe(99)
  })

  it("folds RPG stats into hunter power", () => {
    const low = computeHunterPower(basePlayer({ level: 5 }))
    const high = computeHunterPower(
      basePlayer({
        rpgStats: {
          strength: 200,
          agility: 200,
          intelligence: 200,
          vitality: 200,
        },
      })
    )
    expect(high.total).toBeGreaterThan(low.total)
    expect(high.attack).toBeGreaterThan(low.attack)
  })
})
