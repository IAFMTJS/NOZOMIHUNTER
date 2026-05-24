import { describe, expect, it } from "vitest"
import {
  creditsForXpAmount,
  canConvertXp,
  conversionsRemainingToday,
} from "@/systems/economy/xpConversionSystem"
import {
  xpGainMultiplier,
  maxWrongAttemptsWithBoosts,
  canStackBoost,
  buildActiveBoostFromItem,
} from "@/systems/economy/boostSystem"
import {
  selectDailyRotationKeys,
  effectiveUnitPrice,
  isRotationAvailable,
} from "@/systems/economy/shopRotationSystem"
import { difficultyOverrideApplies, previewCompletionRewards } from "@/systems/economy/shopEffectSystem"
import type { PlayerContract } from "@/contracts/player-contract"
import type { ItemCatalogEntryContract } from "@/contracts/economy-contract"
import { defaultEconomy } from "@/systems/economy/staminaSystem"
import { deriveRpgStatsFromProgress } from "@/systems/progression/rpgStatsSystem"

function testPlayer(overrides: Partial<PlayerContract> = {}): PlayerContract {
  const level = overrides.level ?? 10
  const rank = overrides.rank ?? "D"
  return {
    id: "00000000-0000-4000-8000-000000000001",
    username: "Hunter",
    identity: { codename: "NOZOMI", registryId: "HN-0001" },
    synchronization: {
      chainDays: 0,
      lastActiveDate: null,
      status: "STABLE",
      atRisk: false,
    },
    level,
    xp: 5000,
    rank,
    rpgStats: deriveRpgStatsFromProgress(level, rank),
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
    progression: { unlockedDungeons: [], unlockedSystems: [], titles: [] },
    economy: { ...defaultEconomy(), credits: 500, ...overrides.economy },
    inventory: [],
    trackedQuestId: null,
    pendingRewards: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  }
}

describe("xpConversionSystem", () => {
  it("applies inefficient conversion for 1000 XP with tax", () => {
    expect(creditsForXpAmount(1000)).toBe(49)
  })

  it("respects daily conversion limit", () => {
    const player = testPlayer({
      economy: {
        ...defaultEconomy(),
        xpConversionCount: 3,
        xpConversionDate: new Date().toISOString().slice(0, 10),
      },
    })
    expect(
      conversionsRemainingToday(
        player.economy.xpConversionCount,
        player.economy.xpConversionDate
      )
    ).toBe(0)
    expect(canConvertXp(player, 100)).toBe(false)
  })
})

describe("boostSystem", () => {
  it("blocks stacking XP boosters", () => {
    const existing = buildActiveBoostFromItem("xp-booster-small")!
    expect(
      canStackBoost([existing], buildActiveBoostFromItem("xp-booster-major")!)
    ).toBe(false)
  })

  it("applies mistake shield to wrong attempt cap", () => {
    const player = testPlayer({
      economy: {
        ...defaultEconomy(),
        activeBoosts: [buildActiveBoostFromItem("unlimited-mistakes")!],
      },
    })
    expect(maxWrongAttemptsWithBoosts(player, 3)).toBeGreaterThan(100)
  })

  it("multiplies XP from active booster", () => {
    const player = testPlayer({
      economy: {
        ...defaultEconomy(),
        activeBoosts: [buildActiveBoostFromItem("xp-booster-insane")!],
      },
    })
    expect(xpGainMultiplier(player)).toBe(2)
  })
})

describe("shopEffectSystem", () => {
  it("applies difficulty override only on easy contracts", () => {
    const player = testPlayer({
      economy: {
        ...defaultEconomy(),
        activeBoosts: [buildActiveBoostFromItem("system-breach")!],
      },
    })
    const easyQuest = {
      id: "q1",
      difficulty: "EASY",
      type: "VOCABULARY",
      rewards: { xp: 50 },
      narrativeTier: "SIDE",
    } as never
    expect(difficultyOverrideApplies(player, easyQuest)).toBe(true)
  })

  it("previews completion rewards with fatigue and boosters", () => {
    const player = testPlayer({
      economy: {
        ...defaultEconomy(),
        activeBoosts: [
          buildActiveBoostFromItem("reward-amplifier")!,
          buildActiveBoostFromItem("xp-booster-insane")!,
        ],
      },
    })
    const quest = {
      id: "q1",
      difficulty: "NORMAL",
      type: "VOCABULARY",
      rewards: { xp: 80, credits: 20 },
      narrativeTier: "SIDE",
    } as never
    const preview = previewCompletionRewards(player, quest, 0)
    expect(preview.xp).toBe(320)
    expect(preview.credits).toBe(40)
  })
})

describe("shopRotationSystem", () => {
  it("selects deterministic daily rotation", () => {
    const keys = ["a", "b", "c", "d", "e", "f", "g", "h", "i"]
    const a = selectDailyRotationKeys(keys, "player:2026-05-24")
    const b = selectDailyRotationKeys(keys, "player:2026-05-24")
    expect(a).toEqual(b)
    expect(a.length).toBeLessThanOrEqual(8)
  })

  it("applies featured discount", () => {
    expect(effectiveUnitPrice(100, true, 20)).toBe(80)
  })

  it("always allows non-rotation items", () => {
    const item = {
      key: "hunter-blade",
      rotationEligible: false,
    } as ItemCatalogEntryContract
    expect(isRotationAvailable(item, [])).toBe(true)
  })
})
