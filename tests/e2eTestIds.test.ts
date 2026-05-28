import { describe, expect, it } from "vitest"
import { E2E_TEST_IDS } from "@/config/e2eTestIds"

describe("e2eTestIds", () => {
  it("exposes stable dungeon and training selectors", () => {
    expect(E2E_TEST_IDS.trainingPlay("KANA_DASH")).toBe("training-play-kana-dash")
    expect(E2E_TEST_IDS.dungeonAbandon).toBe("dungeon-abandon")
    expect(E2E_TEST_IDS.prepareDeploy).toBe("prepare-deploy")
  })
})
