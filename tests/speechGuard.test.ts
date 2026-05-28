import { describe, expect, it, beforeEach } from "vitest"
import {
  canSubmitSpeech,
  resetSpeechWindow,
} from "@/systems/antiExploit/speechGuard"

describe("speechGuard", () => {
  const playerId = "test-player"

  beforeEach(() => {
    resetSpeechWindow(playerId)
  })

  it("allows submissions within the per-minute window", () => {
    for (let i = 0; i < 24; i++) {
      expect(canSubmitSpeech(playerId)).toBe(true)
    }
  })

  it("blocks after max attempts in the rolling window", () => {
    for (let i = 0; i < 24; i++) {
      canSubmitSpeech(playerId)
    }
    expect(canSubmitSpeech(playerId)).toBe(false)
  })

  it("resets limit for a player after resetSpeechWindow", () => {
    for (let i = 0; i < 24; i++) {
      canSubmitSpeech(playerId)
    }
    resetSpeechWindow(playerId)
    expect(canSubmitSpeech(playerId)).toBe(true)
  })
})
