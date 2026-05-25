import type { PlayerContract } from "@/contracts/player-contract"
import { defaultEconomy } from "@/systems/economy/staminaSystem"
import { deriveRpgStatsFromProgress } from "@/systems/progression/rpgStatsSystem"

/** Complete PlayerContract stub for unit tests (strict TypeScript-safe). */
export function mockPlayerContract(
  overrides: Partial<PlayerContract> = {}
): PlayerContract {
  const level = overrides.level ?? 1
  const rank = overrides.rank ?? "E"
  return {
    id: "00000000-0000-4000-8000-000000000001",
    username: "Hunter",
    xp: 0,
    level,
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
