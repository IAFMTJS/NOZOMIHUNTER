import { describe, expect, it } from "vitest"
import { GAME_MODE_REGISTRY, isGameModeUnlocked } from "@/config/gameModeRegistry"
import { mockPlayerContract } from "./helpers/mockPlayerContract"

describe("gameModeRegistry", () => {
  it("registers all evolution modes", () => {
    expect(GAME_MODE_REGISTRY.SIGNAL_CALIBRATION.enabled).toBe(true)
    expect(GAME_MODE_REGISTRY.SEMANTIC_NETWORK.label).toContain("Semantic")
  })

  it("gates by min level", () => {
    expect(
      isGameModeUnlocked(
        "KANJI_SURGERY",
        mockPlayerContract({
          level: 2,
          progression: {
            unlockedDungeons: ["dungeon:corruption-run"],
            unlockedSystems: ["system:semantic-network"],
            titles: [],
            discipline: 0,
          },
        })
      )
    ).toBe(false)
    expect(
      isGameModeUnlocked(
        "KANJI_SURGERY",
        mockPlayerContract({
          level: 3,
          progression: {
            unlockedDungeons: ["dungeon:corruption-run"],
            unlockedSystems: ["system:semantic-network"],
            titles: [],
            discipline: 0,
          },
        })
      )
    ).toBe(true)
  })
})
