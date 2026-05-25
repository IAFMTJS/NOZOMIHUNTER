import { describe, expect, it } from "vitest"
import { isBannedDialogueLine, pickDialogueLine, getMasterDefinition } from "@/config/dungeonMastersConfig"
import { resolveMasterForDungeonKey, masterAwarenessTier } from "@/systems/dungeons/dungeonMasterSystem"
import {
  dialogueOnFirstMistake,
  isPerfectClearRun,
} from "@/systems/dungeons/dungeonMasterDialogueSystem"
import {
  applyGateProtocolRoutePenalty,
  buildMemoryDebtVocabularyEncounter,
} from "@/systems/dungeons/dungeonMasterRuleSystem"
import {
  computeMasterCompletionGrants,
  relationshipTitleKey,
} from "@/systems/dungeons/dungeonMasterMemorySystem"
import type { DungeonRunContract } from "@/contracts/dungeon-contract"
import type { DungeonMasterId } from "@/contracts/dungeon-master-contract"
import { initThreatState } from "@/systems/dungeons/dungeonThreatSystem"

function baseRun(masterId: DungeonMasterId = "neon-warden"): DungeonRunContract {
  return {
    dungeon: {
      id: "dungeon-test",
      name: "Test",
      description: "Test",
      theme: "CYBER_TOKYO",
      difficulty: "RANK_E",
      encounters: [],
      boss: { id: "boss-dungeon:neon-corridor", name: "Warden", phases: 2, speechDifficulty: 1, grammarDifficulty: 1 },
      rewards: { xp: 100 },
      penalties: { corruption: 1, fatigue: 1 },
      multiplayerEnabled: false,
      masterId,
    },
    masterId,
    machineState: "ENCOUNTER",
    currentEncounterIndex: 0,
    activeType: "VOCAB",
    encounterFailures: 0,
    bossPhase: 0,
    runSchemaVersion: 2,
    threat: initThreatState(),
  }
}

describe("dungeonMastersConfig", () => {
  it("rejects banned tutorial phrases", () => {
    expect(isBannedDialogueLine("Great job! You answered correctly.")).toBe(true)
    expect(isBannedDialogueLine("ACCESS DENIED.")).toBe(false)
  })

  it("maps dungeon keys to masters", () => {
    expect(resolveMasterForDungeonKey("dungeon:shadow-archive").id).toBe("archivist")
    expect(resolveMasterForDungeonKey("dungeon:void-pursuit").id).toBe("mirror-hunter")
  })

  it("picks stable dialogue from pool", () => {
    const master = getMasterDefinition("neon-warden")
    const line = pickDialogueLine(master, "ENTRY", "seed-1")
    expect(line).toBeTruthy()
  })
})

describe("dungeonMasterDialogueSystem", () => {
  it("logs first mistake once", () => {
    const run = baseRun()
    const once = dialogueOnFirstMistake(run)
    expect(once.firstMistakeLogged).toBe(true)
    expect(once.masterDialogueLine).toBeTruthy()
    const twice = dialogueOnFirstMistake(once)
    expect(twice.masterDialogueLine).toBe(once.masterDialogueLine)
  })

  it("detects perfect clear", () => {
    const run = { ...baseRun(), encounterFailures: 0, threat: { ...initThreatState(), corruptionPressure: 20 } }
    expect(isPerfectClearRun(run)).toBe(true)
  })
})

describe("dungeonMasterRuleSystem", () => {
  it("applies gate protocol on high danger route", () => {
    const run = baseRun()
    const next = applyGateProtocolRoutePenalty(run, "high")
    expect(next.threat!.corruptionPressure).toBeGreaterThan(run.threat!.corruptionPressure)
  })

  it("builds memory debt vocabulary encounter", () => {
    const enc = buildMemoryDebtVocabularyEncounter(3, new Map([["w1", 10], ["w2", 80]]))
    expect(enc.words.length).toBe(3)
  })
})

describe("dungeonMasterMemorySystem", () => {
  it("grants perfect clear title and relic", () => {
    const player = {
      progression: { unlockedDungeons: [], unlockedSystems: [], titles: [] },
    } as unknown as import("@/contracts/player-contract").PlayerContract
    const run = baseRun("archivist")
    const metrics = {
      cleared: true,
      perfectClear: true,
      encounterFailures: 0,
      corruptionPressure: 10,
      bossPhaseReached: 4,
      runScore: 100,
    }
    const grants = computeMasterCompletionGrants(run, player, metrics)
    expect(grants.titles).toContain("Archive Breaker")
    expect(grants.inventoryItems.some((i) => i.itemKey === "forgotten-index")).toBe(true)
  })

  it("formats relationship title keys", () => {
    expect(relationshipTitleKey("neon-warden", "RIVAL")).toBe("master:neon-warden:rival")
  })
})

describe("masterAwarenessTier", () => {
  it("maps awareness to tiers", () => {
    expect(masterAwarenessTier(10)).toBe(0)
    expect(masterAwarenessTier(30)).toBe(25)
    expect(masterAwarenessTier(100)).toBe(100)
  })
})
