import { describe, expect, it } from "vitest"
import {
  aggregatePassiveBonuses,
  cappedPassiveXpBonusPercent,
  MAX_PASSIVE_XP_BONUS_PERCENT,
} from "@/systems/vocabulary/wordPassiveSystem"

describe("wordPassiveSystem", () => {
  it("caps aggregate passive XP bonus", () => {
    const entries = Array.from({ length: 50 }, (_, i) => ({
      mastery: 90,
      meta: {
        wordId: `word-${i}`,
        captureState: "MASTERED" as const,
        dangerClassification: "ROUTINE" as const,
      },
    }))
    const bonuses = aggregatePassiveBonuses(entries)
    const capped = cappedPassiveXpBonusPercent(bonuses)
    expect(capped).toBe(MAX_PASSIVE_XP_BONUS_PERCENT)
    expect(capped).toBeLessThan(400)
  })
})
