import { describe, expect, it } from "vitest"
import { aggregateLeaderboardFromEvents } from "@/systems/live/leaderboardSystem"

describe("leaderboardSystem", () => {
  it("scores registry events for the operator", () => {
    const rows = aggregateLeaderboardFromEvents(
      [
        {
          id: "1",
          event_type: "QUEST_COMPLETED",
          payload: { xp: 50 },
          created_at: new Date().toISOString(),
        },
        {
          id: "2",
          event_type: "DUNGEON_COMPLETED",
          payload: {},
          created_at: new Date().toISOString(),
        },
      ],
      "Echo"
    )
    expect(rows[0]?.label).toBe("Echo")
    expect(rows[0]?.score).toBeGreaterThan(0)
  })
})
