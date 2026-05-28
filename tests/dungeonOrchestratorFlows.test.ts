import { describe, expect, it } from "vitest"
import type { QuestContract } from "@/contracts/quest-contract"
import type { DungeonRunContract } from "@/contracts/dungeon-contract"
import {
  NEON_CORRIDOR_BOSS_PHASES,
  NEON_CORRIDOR_ROUTE_GRAPH,
} from "@/config/neonCorridorV2Config"
import { initRouteRun } from "@/systems/dungeons/dungeonRouteSystem"
import { initThreatState } from "@/systems/dungeons/dungeonThreatSystem"
import {
  deployDungeon,
  completeDungeonSector,
  finalizeDungeonExtraction,
  failDungeonRun,
  registerEncounterFailure,
  shouldFailDungeon,
} from "@/systems/dungeons/dungeonOrchestrator"
import { DUNGEON_CONFIG } from "@/config/dungeonConfig"

function baseRun(state: DungeonRunContract["machineState"] = "PREPARATION"): DungeonRunContract {
  return {
    dungeon: {
      id: "dungeon:neon-corridor",
      name: "Neon Corridor",
      description: "Test",
      theme: "CYBER_TOKYO",
      difficulty: "RANK_E",
      encounters: [
        { id: "enc-1", type: "VOCAB", completed: false, difficulty: 1 },
      ],
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
    machineState: state,
    currentEncounterIndex: 0,
    activeType: null,
    encounterFailures: 0,
    bossPhase: 0,
    runSchemaVersion: 2,
    threat: initThreatState(),
    routeSelectPending: false,
  }
}

function dungeonQuest(run: DungeonRunContract): QuestContract {
  return {
    id: "dungeon-quest",
    type: "DUNGEON",
    title: "Neon Corridor",
    description: "Test run",
    difficulty: "NORMAL",
    objectives: [
      {
        id: "obj-dungeon",
        description: "Clear the run",
        requiredProgress: 1,
        currentProgress: 0,
        completed: false,
      },
    ],
    rewards: { xp: 100 },
    isTutorial: false,
    dungeonRun: run,
  }
}

describe("deployDungeon", () => {
  it("moves PREPARATION to EXPLORATION and sets V2 route pending", () => {
    const quest = dungeonQuest(baseRun("PREPARATION"))
    const deployed = deployDungeon(quest, "player-1")
    expect(deployed.dungeonRun?.machineState).toBe("EXPLORATION")
    expect(deployed.dungeonRun?.routeSelectPending).toBe(true)
    expect(deployed.dungeonRun?.threat).toBeDefined()
  })
})

describe("completeDungeonSector", () => {
  it("enters REWARD with route select pending on V2", () => {
    let run = initRouteRun(
      { ...baseRun("ENCOUNTER"), activeType: "VOCAB", currentNodeId: "neon-hall" },
      NEON_CORRIDOR_ROUTE_GRAPH
    )
    const quest = dungeonQuest(run)
    const cleared = completeDungeonSector(quest)
    expect(cleared.dungeonRun?.machineState).toBe("REWARD")
    expect(cleared.dungeonRun?.routeSelectPending).toBe(true)
    expect(cleared.dungeonRun?.activeType).toBeNull()
  })
})

describe("finalizeDungeonExtraction", () => {
  it("marks run COMPLETE and objectives done", () => {
    const run = {
      ...baseRun("EXTRACTION"),
      extractionChoicePending: false,
    }
    const quest = dungeonQuest(run)
    const done = finalizeDungeonExtraction(quest)
    expect(done.dungeonRun?.machineState).toBe("COMPLETE")
    expect(done.objectives.every((o) => o.completed)).toBe(true)
  })
})

describe("dungeon failure flow", () => {
  it("registerEncounterFailure increments failures", () => {
    const quest = dungeonQuest(initRouteRun(baseRun("ENCOUNTER"), NEON_CORRIDOR_ROUTE_GRAPH))
    const updated = registerEncounterFailure(quest)
    expect(updated.dungeonRun?.encounterFailures).toBe(1)
  })

  it("shouldFailDungeon when at max failures", () => {
    const run = initRouteRun(baseRun("ENCOUNTER"), NEON_CORRIDOR_ROUTE_GRAPH)
    run.encounterFailures = DUNGEON_CONFIG.MAX_ENCOUNTER_FAILURES
    const quest = dungeonQuest(run)
    expect(shouldFailDungeon(quest)).toBe(true)
  })

  it("failDungeonRun sets FAILURE machine state", () => {
    const quest = dungeonQuest(initRouteRun(baseRun("ENCOUNTER"), NEON_CORRIDOR_ROUTE_GRAPH))
    const result = failDungeonRun(quest, { corruption: 0, fatigue: 0, xpDebt: 0 }, "player-1")
    expect(result.quest.dungeonRun?.machineState).toBe("FAILURE")
    expect(result.penalties).toBeDefined()
  })
})
