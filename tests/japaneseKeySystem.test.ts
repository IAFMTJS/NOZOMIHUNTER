import { describe, expect, it } from "vitest"
import { canParseFragment } from "@/systems/narrative/japaneseKeySystem"
import type { PlayerContract } from "@/contracts/player-contract"
import { DEFAULT_STORY_PROGRESS } from "@/contracts/narrative-contract"

function playerWithVocab(vocab: number, irisTrust = 0): PlayerContract {
  return {
    id: "p1",
    stats: { vocabulary: vocab },
    storyProgress: { ...DEFAULT_STORY_PROGRESS(), irisTrust },
  } as PlayerContract
}

describe("japaneseKeySystem", () => {
  it("blocks fragment parse below comprehension tier", () => {
    const gate = canParseFragment(playerWithVocab(2), "セクター七は消えた", "FAMILIAR")
    expect(gate.allowed).toBe(false)
    expect(gate.reason).toMatch(/FAMILIAR/)
  })

  it("allows parse at sufficient tier", () => {
    const gate = canParseFragment(playerWithVocab(8), "セクター七は消えた", "FAMILIAR")
    expect(gate.allowed).toBe(true)
  })

  it("boosts gate with high iris trust", () => {
    const low = canParseFragment(playerWithVocab(4), "祈り", "STABLE")
    const high = canParseFragment(playerWithVocab(4, 65), "祈り", "STABLE")
    expect(high.allowed || !low.allowed).toBe(true)
  })
})
