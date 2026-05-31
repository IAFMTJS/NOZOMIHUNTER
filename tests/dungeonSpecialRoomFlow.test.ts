import { describe, expect, it } from "vitest"
import { isSpecialRoomEncounter } from "@/systems/dungeons/dungeonV2Helpers"
import type { DungeonRunContract } from "@/contracts/dungeon-contract"

function minimalRun(overrides: Partial<DungeonRunContract>): DungeonRunContract {
  return {
    runSchemaVersion: 2,
    machineState: "ENCOUNTER",
    activeType: null,
    explorationSystemLine: "Story beat — continue when ready.",
    dungeon: {
      id: "dungeon:neon-corridor",
      name: "Neon Corridor",
      theme: "CYBER_TOKYO",
      encounters: [],
      boss: null,
    },
    bossPhase: 0,
    explorationProgress: 100,
    routeSelectPending: false,
    ...overrides,
  } as DungeonRunContract
}

describe("isSpecialRoomEncounter", () => {
  it("detects STORY/RECOVERY/TREASURE mount state", () => {
    expect(isSpecialRoomEncounter(minimalRun({}))).toBe(true)
  })

  it("returns false for vocab encounter", () => {
    expect(
      isSpecialRoomEncounter(
        minimalRun({ activeType: "VOCAB", explorationSystemLine: undefined })
      )
    ).toBe(false)
  })
})
