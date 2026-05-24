import { describe, expect, it } from "vitest"
import { hashSeed } from "@/systems/economy/shopRotationHash"

describe("shopRotationHash", () => {
  it("matches SQL nozomi_shop_hash golden vectors", () => {
    expect(hashSeed("player:2026-05-24")).toBe(3_383_717_048)
    expect(hashSeed("player:2026-05-24:rot:0")).toBe(442_285_579)
    expect(hashSeed("player:2026-05-24:disc:xp-booster-small")).toBe(3_757_888_632)
  })
})
