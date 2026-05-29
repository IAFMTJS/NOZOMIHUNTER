import { describe, expect, it } from "vitest"
import {
  applyLiveModifiersToQuestRewards,
  resolveLiveRewardModifiers,
} from "@/systems/live/liveEventModifierSystem"

describe("liveEventModifierSystem", () => {
  it("returns baseline when no active event", () => {
    const mods = resolveLiveRewardModifiers("stable-seed-no-event")
    expect(mods.xpMultiplier).toBeGreaterThanOrEqual(1)
  })

  it("applies XP multiplier to quest rewards", () => {
    const rewards = applyLiveModifiersToQuestRewards(
      { xp: 100, credits: 5 },
      { xpMultiplier: 1.15, creditsBonus: 3, eventTitle: "Test" }
    )
    expect(rewards.xp).toBe(Math.floor(100 * 1.15))
    expect(rewards.credits).toBe(8)
  })
})
