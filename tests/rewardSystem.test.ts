import { describe, expect, it } from "vitest"
import { calculateQuestReward } from "@/systems/progression/rewardSystem"

describe("calculateQuestReward", () => {
  it("applies fatigue multiplier to XP", () => {
    const full = calculateQuestReward({ xp: 100 }, 1)
    const reduced = calculateQuestReward({ xp: 100 }, 0.5)
    expect(full.xp).toBe(100)
    expect(reduced.xp).toBe(50)
  })
})
