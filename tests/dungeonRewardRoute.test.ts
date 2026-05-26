import { describe, expect, it } from "vitest"
import type { QuestContract } from "@/contracts/quest-contract"
import type { DungeonRunContract } from "@/contracts/dungeon-contract"
import {
  NEON_CORRIDOR_BOSS_PHASES,
  NEON_CORRIDOR_ROUTE_GRAPH,
} from "@/config/neonCorridorV2Config"
import { initRouteRun } from "@/systems/dungeons/dungeonRouteSystem"
import { initThreatState } from "@/systems/dungeons/dungeonThreatSystem"
import { chooseDungeonRoute } from "@/systems/dungeons/dungeonOrchestrator"

function baseRun(): DungeonRunContract {
  return {
    dungeon: {
      id: "dungeon:neon-corridor",
      name: "Neon Corridor",
      description: "Test",
      theme: "CYBER_TOKYO",
      difficulty: "RANK_E",
      encounters: [],
      boss: {
        id: "boss-1",
        name: "Warden",
        phases: 3,
        phaseSpecs: NEON_CORRIDOR_BOSS_PHASES,
        speechDifficulty: 1,
        grammarDifficulty: 1,
      },
      rewards: { xp: 100 },
      penalties: { corruption: 1, fatigue: 1 },
      multiplayerEnabled: false,
    },
    machineState: "REWARD",
    currentEncounterIndex: 0,
    activeType: null,
    encounterFailures: 0,
    bossPhase: 0,
    runSchemaVersion: 2,
    threat: initThreatState(),
    routeSelectPending: true,
  }
}

function dungeonQuest(run: DungeonRunContract): QuestContract {
  return {
    id: "dungeon-quest",
    type: "DUNGEON",
    title: "Neon Corridor",
    description: "Test run",
    difficulty: "NORMAL",
    objectives: [],
    rewards: { xp: 100 },
    isTutorial: false,
    dungeonRun: run,
  }
}

describe("chooseDungeonRoute from REWARD", () => {
  it("transitions through exploration into sector encounter without invalid transition", () => {
    const run = initRouteRun(baseRun(), NEON_CORRIDOR_ROUTE_GRAPH)
    const quest = dungeonQuest(run)

    const updated = chooseDungeonRoute(quest, "neon-hall", 0, 5)
    const nextState = updated.dungeonRun?.machineState

    expect(nextState).not.toBe("REWARD")
    expect(["EXPLORATION", "ENCOUNTER", "BOSS"]).toContain(nextState)
  })
})
