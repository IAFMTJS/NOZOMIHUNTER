import { describe, expect, it } from "vitest"
import { pickDailyTrainingPriority } from "@/systems/training/trainingPrioritySystem"
import type { PlayerContract } from "@/contracts/player-contract"
import { defaultProgression } from "@/systems/progression/unlockSystem"

const player: PlayerContract = {
  id: "00000000-0000-4000-8000-000000000002",
  username: "p",
  identity: { codename: "Test", registryId: "HN-0002" },
  synchronization: {
    chainDays: 0,
    lastActiveDate: null,
    status: "DORMANT",
    atRisk: false,
  },
  level: 5,
  xp: 0,
  rank: "E",
  stats: {
    vocabulary: 1,
    grammar: 5,
    listening: 2,
    speaking: 3,
    confidence: 0,
    intelligence: 0,
    consistency: 0,
  },
  rpgStats: { strength: 8, agility: 8, intelligence: 10, vitality: 8 },
  penalties: { corruption: 0, fatigue: 0, xpDebt: 0 },
  progression: defaultProgression(),
  economy: {
    credits: 0,
    stamina: 5,
    staminaMax: 5,
    brewTokens: 0,
    activeBoosts: [],
    xpConversionCount: 0,
    xpConversionDate: null,
  },
  inventory: [],
  trackedQuestId: null,
  pendingRewards: null,
  createdAt: "",
  updatedAt: "",
}

describe("trainingPrioritySystem", () => {
  it("returns deterministic priority for same seed", () => {
    const a = pickDailyTrainingPriority(player, "2026-05-29")
    const b = pickDailyTrainingPriority(player, "2026-05-29")
    expect(a).toBe(b)
  })
})
