import { describe, expect, it } from "vitest"
import {
  applyLocalStoryBeatComplete,
  canUnlockBeat,
  isBeatCompleted,
  resolveStoryProgress,
} from "@/systems/narrative/storyProgressSystem"
import { DEFAULT_STORY_PROGRESS } from "@/contracts/narrative-contract"
import type { PlayerContract } from "@/contracts/player-contract"

function stubPlayer(): PlayerContract {
  return {
    id: "p1",
    storyProgress: DEFAULT_STORY_PROGRESS(),
  } as PlayerContract
}

describe("storyProgressSystem", () => {
  it("tracks beat completion locally", () => {
    let player = stubPlayer()
    player = applyLocalStoryBeatComplete(player, "beat-s01-001", "whisper-index")
    expect(isBeatCompleted(resolveStoryProgress(player), "beat-s01-001")).toBe(true)
    expect(player.storyProgress?.archiveUnlockedIds).toContain("whisper-index")
  })

  it("gates beats on prerequisites", () => {
    const progress = DEFAULT_STORY_PROGRESS()
    expect(canUnlockBeat(progress, "beat-s01-001")).toBe(false)
    const withFirst = applyLocalStoryBeatComplete(stubPlayer(), "beat-s01-001")
    expect(canUnlockBeat(withFirst.storyProgress!, "beat-s01-001")).toBe(true)
  })
})
