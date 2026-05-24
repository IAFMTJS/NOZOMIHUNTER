import { describe, expect, it } from "vitest"
import {
  resolveVisibleLayers,
  resolveInputMode,
  pickPromptDirection,
} from "@/systems/learning/challengeDisplaySystem"

describe("challengeDisplaySystem", () => {
  it("hides meaning during RETRIEVE_ENGLISH active challenge", () => {
    const layers = resolveVisibleLayers("RETRIEVE_ENGLISH", "ACTIVE", "FULL", true)
    expect(layers.japanese).toBe(true)
    expect(layers.meaning).toBe(false)
  })

  it("shows full triple on reveal", () => {
    const layers = resolveVisibleLayers("RETRIEVE_ENGLISH", "REVEALED", "FULL", true)
    expect(layers.meaning).toBe(true)
    expect(layers.japanese).toBe(true)
  })

  it("hides all text during LISTEN_DECODE active", () => {
    const layers = resolveVisibleLayers("LISTEN_DECODE", "ACTIVE", "FULL", true)
    expect(layers.japanese).toBe(false)
    expect(layers.meaning).toBe(false)
  })

  it("locks input mode per direction", () => {
    expect(resolveInputMode("RETRIEVE_ENGLISH")).toBe("english")
    expect(resolveInputMode("LISTEN_DECODE")).toBe("romaji")
  })

  it("rotates prompt direction by mastery", () => {
    expect(pickPromptDirection("12345", 20)).toBe("RETRIEVE_ENGLISH")
    expect(["RETRIEVE_JAPANESE", "RETRIEVE_READING"]).toContain(
      pickPromptDirection("12345", 80)
    )
  })
})
