import { describe, expect, it } from "vitest"
import { usePlayerStore } from "@/stores/usePlayerStore"

describe("hydration terminal state", () => {
  it("markHydrationTerminal sets isHydrated true without player", () => {
    usePlayerStore.setState({ isHydrated: false, player: null, activeQuests: [] })
    usePlayerStore.getState().markHydrationTerminal()
    expect(usePlayerStore.getState().isHydrated).toBe(true)
  })
})
