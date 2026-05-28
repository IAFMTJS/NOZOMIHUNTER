import { describe, expect, it } from "vitest"
import { resolveVisibleLayers } from "@/systems/learning/challengeDisplaySystem"

describe("learner display compliance", () => {
  it("BLACKOUT hides glosses in challenge mode for RETRIEVE_ENGLISH", () => {
    const layers = resolveVisibleLayers("RETRIEVE_ENGLISH", "ACTIVE", "BLACKOUT", true)
    expect(layers.meaning).toBe(false)
    expect(layers.romaji).toBe(false)
    expect(layers.reading).toBe(false)
    expect(layers.japanese).toBe(true)
  })

  it("REDUCED hides meaning during active challenge", () => {
    const layers = resolveVisibleLayers("RETRIEVE_ENGLISH", "ACTIVE", "REDUCED", true)
    expect(layers.meaning).toBe(false)
    expect(layers.reading).toBe(false)
  })

  it("REVEALED phase shows all layers", () => {
    const layers = resolveVisibleLayers("RETRIEVE_ENGLISH", "REVEALED", "BLACKOUT", true)
    expect(layers.meaning).toBe(true)
    expect(layers.romaji).toBe(true)
  })
})
