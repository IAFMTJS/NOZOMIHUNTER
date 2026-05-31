import { describe, expect, it } from "vitest"
import {
  NEON_CORRIDOR_ROUTE_GRAPH,
  NEON_CORRIDOR_BOSS_PHASES,
} from "@/config/neonCorridorV2Config"
import {
  chooseRouteExit,
  initRouteRun,
  listRouteChoices,
  markNodeCompleted,
} from "@/systems/dungeons/dungeonRouteSystem"
import {
  applyCorrectConsequence,
  applyWrongConsequence,
  initThreatState,
} from "@/systems/dungeons/dungeonThreatSystem"
import {
  defaultActionForLevel,
  resolveActionToDirection,
  unlockedActionsForLevel,
} from "@/systems/dungeons/dungeonActionSystem"
import type { DungeonRunContract } from "@/contracts/dungeon-contract"
import { resolveBossPhaseCount } from "@/systems/dungeons/dungeonV2Helpers"

function baseRun(): DungeonRunContract {
  return {
    dungeon: {
      id: "dungeon-test",
      name: "Test",
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
    machineState: "EXPLORATION",
    currentEncounterIndex: 0,
    activeType: null,
    encounterFailures: 0,
    bossPhase: 0,
    runSchemaVersion: 2,
    threat: initThreatState(),
  }
}

describe("dungeonRouteSystem", () => {
  it("lists exits from entry", () => {
    const run = initRouteRun(baseRun(), NEON_CORRIDOR_ROUTE_GRAPH)
    const choices = listRouteChoices(run)
    expect(choices.map((c) => c.id)).toEqual([
      "neon-hall",
      "archive-door",
      "recovery-alcove",
    ])
  })

  it("advances to encounter node", () => {
    let run = initRouteRun(baseRun(), NEON_CORRIDOR_ROUTE_GRAPH)
    const { run: atHall } = chooseRouteExit(run, "neon-hall")
    expect(atHall.currentNodeId).toBe("neon-hall")
    expect(atHall.explorationBeat).toBe("ENGAGE")
  })

  it("marks node complete and opens route select", () => {
    let run = initRouteRun(baseRun(), NEON_CORRIDOR_ROUTE_GRAPH)
    run = { ...run, currentNodeId: "neon-hall" }
    const next = markNodeCompleted(run, "neon-hall")
    expect(next.completedNodeIds).toContain("neon-hall")
    expect(next.routeSelectPending).toBe(true)
  })
})

describe("dungeonThreatSystem", () => {
  it("raises corruption and awareness on wrong", () => {
    const run = baseRun()
    const { run: next, forceBoss } = applyWrongConsequence(run)
    expect(next.threat!.corruptionPressure).toBeGreaterThan(run.threat!.corruptionPressure)
    expect(next.threat!.bossAwareness).toBeGreaterThan(run.threat!.bossAwareness)
    expect(forceBoss).toBe(false)
  })

  it("lowers corruption on correct streak", () => {
    const run = {
      ...baseRun(),
      threat: { ...initThreatState(), corruptionPressure: 20 },
    }
    const { run: next } = applyCorrectConsequence(run, 3)
    expect(next.threat!.corruptionPressure).toBeLessThan(20)
  })
})

describe("dungeonActionSystem", () => {
  it("gates actions by level", () => {
    expect(unlockedActionsForLevel(1)).toEqual(["STRIKE"])
    expect(unlockedActionsForLevel(4)).toContain("SEAL")
    expect(unlockedActionsForLevel(6)).toContain("COUNTER")
  })

  it("maps STRIKE to English retrieval", () => {
    expect(resolveActionToDirection("STRIKE")).toBe("RETRIEVE_ENGLISH")
    expect(resolveActionToDirection("SEAL")).toBe("RETRIEVE_READING")
  })

  it("defaults action by level", () => {
    expect(defaultActionForLevel(2)).toBe("STRIKE")
  })
})

describe("dungeon v2 persistence shape", () => {
  it("resolves boss phase count from specs", () => {
    const run = baseRun()
    expect(resolveBossPhaseCount(run)).toBe(3)
  })

  it("round-trips v2 fields in JSON", () => {
    const run = initRouteRun(
      { ...baseRun(), runScore: 10, completedNodeIds: [] },
      NEON_CORRIDOR_ROUTE_GRAPH
    )
    const parsed = JSON.parse(JSON.stringify(run)) as DungeonRunContract
    expect(parsed.runSchemaVersion).toBe(2)
    expect(parsed.routeGraph?.entryId).toBe("entry")
    expect(parsed.threat?.signalStability).toBe(100)
  })
})
