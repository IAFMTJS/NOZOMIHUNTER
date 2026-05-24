import { describe, expect, it } from "vitest"
import { GAME_MODE_REGISTRY, isGameModeUnlocked } from "@/config/gameModeRegistry"
import type { PlayerContract } from "@/contracts/player-contract"

const mockPlayer = (level: number): PlayerContract =>
  ({
    id: "test",
    level,
    progression: {
      unlockedDungeons: ["dungeon:corruption-run"],
      unlockedSystems: ["system:semantic-network"],
      titles: [],
    },
  }) as PlayerContract

describe("gameModeRegistry", () => {
  it("registers all evolution modes", () => {
    expect(GAME_MODE_REGISTRY.SIGNAL_CALIBRATION.enabled).toBe(true)
    expect(GAME_MODE_REGISTRY.SEMANTIC_NETWORK.label).toContain("Semantic")
  })

  it("gates by min level", () => {
    expect(isGameModeUnlocked("KANJI_SURGERY", mockPlayer(2))).toBe(false)
    expect(isGameModeUnlocked("KANJI_SURGERY", mockPlayer(3))).toBe(true)
  })
})
