import { describe, expect, it } from "vitest"
import { failDungeonRun } from "@/systems/dungeons/dungeonFailureFlow"
import {
  DUNGEON_FAILURE_CEREMONY_TEST_ID,
  shouldShowDungeonFailureCeremony,
} from "@/systems/dungeons/dungeonFailureCeremonyFlow"
import { E2E_TEST_IDS } from "@/config/e2eTestIds"
import { DUNGEON_CONFIG } from "@/config/dungeonConfig"
import { initRouteRun } from "@/systems/dungeons/dungeonRouteSystem"
import { initThreatState } from "@/systems/dungeons/dungeonThreatSystem"
import {
  NEON_CORRIDOR_BOSS_PHASES,
  NEON_CORRIDOR_ROUTE_GRAPH,
} from "@/config/neonCorridorV2Config"
import type { DungeonRunContract } from "@/contracts/dungeon-contract"
import type { QuestContract } from "@/contracts/quest-contract"

function baseRun(state: DungeonRunContract["machineState"]): DungeonRunContract {
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

describe("dungeon failure ceremony E2E path", () => {
  it("exposes stable Playwright selector aligned with component", () => {
    expect(DUNGEON_FAILURE_CEREMONY_TEST_ID).toBe(E2E_TEST_IDS.dungeonFailureCeremony)
    expect(DUNGEON_FAILURE_CEREMONY_TEST_ID).toBe("dungeon-failure-ceremony")
  })

  it("opens overlay only on FAILURE before dismiss", () => {
    expect(shouldShowDungeonFailureCeremony("FAILURE", false)).toBe(true)
    expect(shouldShowDungeonFailureCeremony("FAILURE", true)).toBe(false)
    expect(shouldShowDungeonFailureCeremony("ENCOUNTER", false)).toBe(false)
  })

  it("failDungeonRun leaves machine in FAILURE for ceremony trigger", () => {
    const run = initRouteRun(baseRun("ENCOUNTER"), NEON_CORRIDOR_ROUTE_GRAPH)
    run.encounterFailures = DUNGEON_CONFIG.MAX_ENCOUNTER_FAILURES
    const quest = dungeonQuest(run)
    const result = failDungeonRun(quest, { corruption: 0, fatigue: 0, xpDebt: 0 }, "p1")
    expect(result.quest.dungeonRun?.machineState).toBe("FAILURE")
    expect(
      shouldShowDungeonFailureCeremony(result.quest.dungeonRun!.machineState, false)
    ).toBe(true)
  })
})
