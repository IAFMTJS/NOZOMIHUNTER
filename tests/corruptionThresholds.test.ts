import { describe, expect, it } from "vitest"
import {
  corruptionBandFromPercent,
  CORRUPTION_THRESHOLDS,
} from "@/config/corruptionThresholds"
import { shellClassesForCorruptionBand } from "@/systems/presentation/corruptionPresentationSystem"

describe("corruptionThresholds", () => {
  it("maps percent to bands", () => {
    expect(corruptionBandFromPercent(10)).toBe("stable")
    expect(corruptionBandFromPercent(40)).toBe("unstable")
    expect(corruptionBandFromPercent(60)).toBe("dangerous")
    expect(corruptionBandFromPercent(90)).toBe("critical")
    expect(corruptionBandFromPercent(100)).toBe("collapse")
  })

  it("exposes collapse at 100", () => {
    expect(CORRUPTION_THRESHOLDS.COLLAPSE).toBe(100)
  })

  it("returns css class per band", () => {
    expect(shellClassesForCorruptionBand("dangerous")).toContain("dangerous")
  })
})
