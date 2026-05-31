import { describe, expect, it } from "vitest"
import { resolveWordCount, resolveListeningFragmentCount } from "@/systems/learning/encounterScaleSystem"

describe("encounterScaleSystem", () => {
  it("scales story vocab by player level tier", () => {
    expect(resolveWordCount({ context: "story", playerLevel: 1 })).toBe(3)
    expect(resolveWordCount({ context: "story", playerLevel: 20 })).toBe(5)
    expect(resolveWordCount({ context: "story", playerLevel: 40 })).toBe(7)
  })

  it("respects explicit word count override", () => {
    expect(
      resolveWordCount({ context: "dungeon-sector", playerLevel: 40, explicit: 2 })
    ).toBe(2)
  })

  it("scales listening fragments", () => {
    expect(resolveListeningFragmentCount(1)).toBeGreaterThan(0)
    expect(resolveListeningFragmentCount(40)).toBeGreaterThan(
      resolveListeningFragmentCount(1)
    )
  })
})
