import { describe, expect, it } from "vitest"
import {
  orchestrateEncounterFeedback,
  resolveEncounterChannel,
} from "@/systems/presentation/encounterFeedbackOrchestrator"
import {
  ceremonyTierFromNarrative,
} from "@/systems/presentation/ceremonies/ceremonyTypes"
import { ceremonyTierFromNarrativeContract } from "@/contracts/presentation-contract"
import { masteryTierFromPercent } from "@/systems/presentation/masteryPresentationSystem"
import {
  createMemoryGridRound,
  flipMemoryGridCard,
  isMemoryGridComplete,
} from "@/systems/training/memoryGridSystem"
import {
  checkEchoReconstruction,
  createEchoListeningRound,
  selectEchoChunk,
} from "@/systems/training/echoListeningSystem"

describe("encounterFeedbackOrchestrator", () => {
  it("maps dungeon wrong answers to corruption fx", () => {
    const r = orchestrateEncounterFeedback({
      channel: "DUNGEON",
      outcome: "wrong",
      previousStreak: 0,
    })
    expect(r.cssClasses).toContain("nozomi-dungeon-unstable")
    expect(r.audioCues).toContain("corruption")
    expect(r.freezeMs).toBe(120)
  })

  it("applies dungeon freeze on combo milestones only", () => {
    const low = orchestrateEncounterFeedback({
      channel: "DUNGEON",
      outcome: "correct",
      correctStreak: 1,
    })
    expect(low.freezeMs).toBeUndefined()

    const high = orchestrateEncounterFeedback({
      channel: "DUNGEON",
      outcome: "correct",
      correctStreak: 3,
    })
    expect(high.freezeMs).toBe(300)
  })

  it("resolves training channel from flags", () => {
    expect(
      resolveEncounterChannel({ isTraining: true, narrativeTier: "MAIN" })
    ).toBe("TRAINING")
  })
})

describe("ceremony tiers", () => {
  it("aligns contract helper with ceremony types", () => {
    expect(ceremonyTierFromNarrativeContract("DAILY")).toBe("light")
    expect(ceremonyTierFromNarrativeContract(undefined, true)).toBe("dungeon")
    expect(ceremonyTierFromNarrative("SIDE")).toBe("medium")
  })
})

describe("memoryGridSystem", () => {
  it("completes when all pairs matched", () => {
    let round = createMemoryGridRound(2)
    const pairIds = [...new Set(round.cards.map((c) => c.pairId))]
    for (const pairId of pairIds) {
      const a = round.cards.find((c) => c.pairId === pairId && c.id.endsWith("-jp"))!
      const b = round.cards.find((c) => c.pairId === pairId && c.id.endsWith("-en"))!
      const r1 = flipMemoryGridCard(round, a.id)
      const r2 = flipMemoryGridCard(r1.round, b.id)
      expect(r2.matched).toBe(true)
      round = r2.round
    }
    expect(isMemoryGridComplete(round)).toBe(true)
  })
})

describe("echoListeningSystem", () => {
  it("validates chunk order", () => {
    const round = createEchoListeningRound()
    const ordered = [...round.chunks].sort((a, b) => a.orderIndex - b.orderIndex)
    let state = round
    for (const c of ordered) {
      state = selectEchoChunk(state, c.id)
    }
    expect(checkEchoReconstruction(state)).toBe(true)
  })
})

describe("masteryPresentationSystem", () => {
  it("maps percent to canonical tiers", () => {
    expect(masteryTierFromPercent(0)).toBe("UNKNOWN")
    expect(masteryTierFromPercent(25)).toBe("SEEN")
    expect(masteryTierFromPercent(50)).toBe("FAMILIAR")
    expect(masteryTierFromPercent(70)).toBe("STABLE")
    expect(masteryTierFromPercent(85)).toBe("MASTERED")
  })
})
