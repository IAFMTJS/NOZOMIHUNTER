import { describe, expect, it } from "vitest"
import {
  pickActiveCeremonyQueue,
  shouldDeferCeremony,
} from "@/systems/presentation/ceremonyQueueSystem"

describe("ceremonyQueueSystem", () => {
  it("prioritizes sync discipline over achievements", () => {
    const kind = pickActiveCeremonyQueue({
      syncDiscipline: "title:discipline-3",
      achievement: [{ id: "a" }],
    })
    expect(kind).toBe("syncDiscipline")
  })

  it("defers lower-priority ceremonies while one is active", () => {
    expect(shouldDeferCeremony("syncDiscipline", "achievement")).toBe(true)
    expect(shouldDeferCeremony("achievement", "syncDiscipline")).toBe(false)
  })
})
