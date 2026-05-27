import { describe, expect, it } from "vitest"
import {
  buildCompanionWhisper,
  canRequestWhisper,
  masteryLearningStage,
  mergeVisibleLayers,
  resolveHintSessionLimits,
  resolveHunterVisionReveal,
  shouldAutoWhisper,
  visionLayersFromReveal,
} from "@/systems/hints/hintSystem"
import type { HintWordContextContract } from "@/contracts/hint-contract"

const baseContext: HintWordContextContract = {
  wordId: "w1",
  japanese: "海",
  reading: "うみ",
  romaji: "umi",
  meaning: "sea",
  masteryScore: 10,
  wrongAttempts: 0,
  promptDirection: "RETRIEVE_ENGLISH",
}

describe("hintSystem", () => {
  it("stages mastery from score", () => {
    expect(masteryLearningStage(10)).toBe("EXPOSURE")
    expect(masteryLearningStage(50)).toBe("ASSISTED_RECALL")
    expect(masteryLearningStage(80)).toBe("PRESSURE")
  })

  it("blocks hints under BLACKOUT assist", () => {
    const limits = resolveHintSessionLimits({
      assistLevel: "BLACKOUT",
      whispersUsed: 0,
      visionChargesUsed: 0,
    })
    expect(canRequestWhisper(limits)).toBe(false)
    expect(limits.whispersBlocked).toBe(true)
  })

  it("reveals meaning on vision for low mastery", () => {
    const reveal = resolveHunterVisionReveal(baseContext, "FULL")
    expect(reveal.meaning).toBe(true)
    const layers = visionLayersFromReveal(reveal)
    expect(layers.meaning).toBe(true)
  })

  it("merges vision layers over challenge mask", () => {
    const merged = mergeVisibleLayers(
      { japanese: true, reading: false, romaji: false, meaning: false },
      { japanese: true, reading: true, romaji: true, meaning: true }
    )
    expect(merged.reading).toBe(true)
    expect(merged.meaning).toBe(true)
  })

  it("emits failure reinforce whisper after repeated wrong", () => {
    const whisper = buildCompanionWhisper(
      { ...baseContext, wrongAttempts: 2 },
      { forceFailure: true }
    )
    expect(whisper.kind).toBe("FAILURE_REINFORCE")
    expect(whisper.line).toContain("海")
  })

  it("auto whisper triggers once per wrong threshold", () => {
    expect(shouldAutoWhisper(2, 0)).toBe(true)
    expect(shouldAutoWhisper(2, 2)).toBe(false)
  })
})
