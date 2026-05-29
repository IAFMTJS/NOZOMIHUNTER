import { describe, expect, it } from "vitest"
import { checkPrestigeEligibility } from "@/systems/progression/prestigeSystem"
import { mockPlayerContract } from "./helpers/mockPlayerContract"

describe("prestigeSystem", () => {
  it("eligible at SSS rank and level 100", () => {
    const player = mockPlayerContract({
      level: 100,
      rank: "SSS",
    })
    expect(checkPrestigeEligibility(player).eligible).toBe(true)
  })

  it("not eligible below cap", () => {
    const player = mockPlayerContract({ level: 50, rank: "A" })
    expect(checkPrestigeEligibility(player).eligible).toBe(false)
  })
})
