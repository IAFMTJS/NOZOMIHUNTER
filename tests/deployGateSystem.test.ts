import { describe, expect, it } from "vitest"
import { computeReadiness } from "@/systems/readiness/readinessSystem"
import { computePreparationChecklist } from "@/systems/readiness/preparationChecklistSystem"
import {
  isDeployBlocked,
  MIN_OPERATIONAL_READINESS_SCORE,
  resolveDeployBlockers,
} from "@/systems/readiness/deployGateSystem"
import { mockPlayerContract } from "./helpers/mockPlayerContract"

describe("deployGateSystem", () => {
  it("exposes minimum operational readiness aligned with CRITICAL threshold", () => {
    expect(MIN_OPERATIONAL_READINESS_SCORE).toBe(35)
  })

  it("blocks deploy when readiness is critical but checklist rows look green", () => {
    const player = mockPlayerContract({
      penalties: { corruption: 30, fatigue: 20, xpDebt: 55 },
    })
    const readiness = computeReadiness({ player, quest: { type: "DUNGEON" } })
    const checklist = computePreparationChecklist(player, true, [], false)
    expect(checklist.vocabulary).toBe(true)
    expect(checklist.operationalReadiness).toBe(false)

    const blockers = resolveDeployBlockers({ readiness, checklist })
    expect(isDeployBlocked(blockers)).toBe(true)
    expect(blockers.some((b) => b.id === "operational-readiness")).toBe(true)
  })

  it("reports vocabulary prep blockers with missing term count", () => {
    const player = mockPlayerContract()
    const readiness = computeReadiness({
      player,
      vocabularyScore: 40,
      quest: { type: "VOCABULARY" },
    })
    const checklist = computePreparationChecklist(player, false, [], true)
    const blockers = resolveDeployBlockers({
      readiness,
      checklist,
      vocabularyPrep: { missingCount: 3, currentScore: 40 },
    })
    expect(blockers.some((b) => b.id === "vocabulary-prep")).toBe(true)
    expect(blockers.find((b) => b.id === "vocabulary-prep")?.detail).toContain("3 unknown")
  })

  it("allows critical readiness for training drills", () => {
    const player = mockPlayerContract({
      penalties: { corruption: 30, fatigue: 20, xpDebt: 55 },
    })
    const readiness = computeReadiness({ player, quest: { type: "VOCABULARY" } })
    const checklist = computePreparationChecklist(player, true, [], true)
    const blockers = resolveDeployBlockers({
      readiness,
      checklist,
      allowCriticalDeploy: true,
    })
    expect(blockers.some((b) => b.id === "operational-readiness")).toBe(false)
  })

  it("skips equipment and consumables for bootstrap players", () => {
    const player = mockPlayerContract({ level: 1 })
    const checklist = computePreparationChecklist(player, true, [], true)
    expect(checklist.equipment).toBe(true)
    expect(checklist.consumables).toBe(true)
  })
})
