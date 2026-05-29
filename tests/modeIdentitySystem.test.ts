import { describe, expect, it } from "vitest"
import { applyGameModeToQuest } from "@/systems/gameModes/gameModeQuestBuilder"
import { assertModeIdentity } from "@/systems/gameModes/modeIdentitySystem"
import { GAME_MODE_REGISTRY } from "@/config/gameModeRegistry"
import type { GameModeId } from "@/contracts/game-mode-contract"
import type { QuestContract } from "@/contracts/quest-contract"
import type { DungeonRunContract } from "@/contracts/dungeon-contract"

function baseQuest(): QuestContract {
  return {
    id: "q1",
    type: "VOCABULARY",
    title: "Test",
    description: "Test",
    difficulty: "NORMAL",
    rewards: { xp: 10 },
    objectives: [],
  }
}

function withDungeonPayload(mode: GameModeId, quest: QuestContract): QuestContract {
  const partial: Partial<DungeonRunContract> = {}
  if (mode === "VOID_PURSUIT") partial.pursuitDistance = 40
  if (mode === "CORRUPTION_RUN") partial.endlessSectorCount = 1
  if (mode === "ROGUELIKE_SECTOR") {
    partial.dungeonMode = "ROGUELIKE_SECTOR"
    partial.modifiers = [{ id: "m1", label: "Bleed", corruptionMutation: 5 }]
  }
  if (mode === "ARCHIVIST_BOSS") {
    partial.bossPhase = 0
    partial.activeType = "BOSS"
  }
  return { ...quest, gameMode: mode, dungeonRun: partial as DungeonRunContract }
}

const ENABLED_MODES = (Object.keys(GAME_MODE_REGISTRY) as GameModeId[]).filter(
  (id) => GAME_MODE_REGISTRY[id].enabled && id !== "STANDARD"
)

describe("modeIdentitySystem", () => {
  for (const mode of ENABLED_MODES) {
    it(`${mode} exposes unique payload`, () => {
      let quest = applyGameModeToQuest(baseQuest(), mode)
      if (
        mode === "VOID_PURSUIT" ||
        mode === "CORRUPTION_RUN" ||
        mode === "ROGUELIKE_SECTOR" ||
        mode === "ARCHIVIST_BOSS"
      ) {
        quest = withDungeonPayload(mode, quest)
      }
      expect(assertModeIdentity(mode, quest)).toBe(true)
    })
  }
})
