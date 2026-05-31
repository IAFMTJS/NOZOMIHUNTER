import { describe, expect, it } from "vitest"
import {
  getEncounterScriptById,
  primaryGameModeFromScript,
  resolveEncounterScript,
} from "@/config/encounterScriptsConfig"

describe("encounterScriptSystem", () => {
  it("resolves script by dungeon node", () => {
    const script = resolveEncounterScript("dungeon:neon-corridor", "neon-hall")
    expect(script?.id).toBe("neon-hall-vocab")
    expect(primaryGameModeFromScript(script!)).toBe("TERMINAL_BREACH")
  })

  it("includes recovery room script", () => {
    const script = getEncounterScriptById("story-rest-shrine")
    expect(script?.phases[0]?.type).toBe("STORY_BEAT")
  })

  it("mounts story beat room in shadow archive", () => {
    const script = resolveEncounterScript("dungeon:shadow-archive", "story-fragment")
    expect(script?.storyBeatId).toBe("beat-s01-019")
  })
})
