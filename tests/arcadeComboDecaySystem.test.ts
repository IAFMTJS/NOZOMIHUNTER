import { describe, expect, it } from "vitest"
import {
  comboDecayMultiplier,
  effectiveComboScore,
} from "@/systems/training/arcadeComboDecaySystem"

describe("arcadeComboDecaySystem", () => {
  it("decays combo after idle window", () => {
    const now = 20_000
    const last = now - 12_000
    expect(comboDecayMultiplier(last, now)).toBeLessThan(1)
  })

  it("scores with decay multiplier", () => {
    expect(effectiveComboScore(5, 0.5)).toBe(250)
  })
})
