import { describe, expect, it } from "vitest"
import { computeReadiness, isReadinessHardBlocked } from "@/systems/readiness/readinessSystem"
import { mockPlayerContract } from "./helpers/mockPlayerContract"

describe("readiness deploy policy", () => {
  it("blocks critical readiness for standard contracts", () => {
    const player = mockPlayerContract({
      penalties: { corruption: 30, fatigue: 20, xpDebt: 55 },
    })
    const readiness = computeReadiness({ player, quest: { type: "VOCABULARY" } })
    expect(readiness.survivalBand).toBe("CRITICAL")
    expect(isReadinessHardBlocked(readiness)).toBe(true)
  })

  it("allows critical readiness for training drills", () => {
    const player = mockPlayerContract({
      penalties: { corruption: 30, fatigue: 20, xpDebt: 55 },
    })
    const readiness = computeReadiness({ player, quest: { type: "VOCABULARY" } })
    expect(isReadinessHardBlocked(readiness, { allowCritical: true })).toBe(false)
  })
})
