import { describe, expect, it } from "vitest"
import {
  dailyQuestInstanceId,
  pickDailyTemplateIndex,
} from "@/systems/quests/dailyQuestSystem"
import { buildContractCatalog } from "@/systems/quests/contractCatalogSystem"
import type { QuestContract } from "@/contracts/quest-contract"
import {
  canSubmitListeningAnswer,
  checkListeningAnswer,
} from "@/systems/dungeons/listeningEncounterSystem"
import { createListeningEncounter } from "@/systems/dungeons/listeningEncounterSystem"
import { computeWordInstability, hasMemoryDecay } from "@/systems/vocabulary/memoryDecaySystem"
import {
  filterVocabularyCatalog,
  mapCuratedToCatalogEntry,
} from "@/systems/vocabulary/vocabularyCatalogSystem"
import {
  applyStatDeltas,
  statDeltasForQuest,
} from "@/systems/progression/playerStatProgressionSystem"

describe("dailyQuestSystem", () => {
  it("uses deterministic daily id per player and date", () => {
    const id = dailyQuestInstanceId("player-1", "2026-05-24")
    expect(id).toBe("daily-player-1-2026-05-24")
  })

  it("picks stable template index for same seed", () => {
    const a = pickDailyTemplateIndex("p1", "2026-05-24", false)
    const b = pickDailyTemplateIndex("p1", "2026-05-24", false)
    expect(a).toBe(b)
  })
})

describe("contractCatalogSystem", () => {
  it("splits daily and side quests", () => {
    const quests: QuestContract[] = [
      {
        id: "d1",
        type: "VOCABULARY",
        title: "Daily",
        description: "",
        difficulty: "EASY",
        narrativeTier: "DAILY",
        rewards: { xp: 30 },
        objectives: [],
      },
      {
        id: "s1",
        type: "VOCABULARY",
        title: "Side",
        description: "",
        difficulty: "NORMAL",
        narrativeTier: "SIDE",
        rewards: { xp: 50 },
        objectives: [],
      },
    ]
    const catalog = buildContractCatalog(quests)
    expect(catalog.dailyQuests.map((q) => q.id)).toEqual(["d1"])
    expect(catalog.sideQuests.map((q) => q.id)).toEqual(["s1"])
  })
})

describe("listeningEncounterSystem", () => {
  it("requires heardOnce before submit gate", () => {
    const enc = createListeningEncounter(1, "test")
    expect(canSubmitListeningAnswer(enc, false)).toBe(false)
    expect(canSubmitListeningAnswer(enc, true)).toBe(true)
  })

  it("accepts kanji answers", () => {
    const enc = createListeningEncounter(1, "test")
    const frag = enc.fragments[0]!
    expect(checkListeningAnswer(enc, frag.japanese)).toBe(true)
  })
})

describe("memoryDecaySystem", () => {
  it("flags decay for stale mastery", () => {
    const old = new Date(Date.now() - 10 * 86_400_000).toISOString()
    const instability = computeWordInstability({
      wordId: "1",
      mastery: 40,
      correctCount: 1,
      wrongCount: 0,
      lastSeenAt: old,
    })
    expect(hasMemoryDecay(instability)).toBe(true)
  })
})

describe("vocabularyCatalogSystem", () => {
  it("defaults threats tab to unconquered entries", () => {
    const entries = [
      mapCuratedToCatalogEntry(
        {
          entSeq: 1,
          japanese: ["水"],
          reading: ["みず"],
          romaji: "mizu",
          meanings: ["water"],
        },
        undefined
      ),
      mapCuratedToCatalogEntry(
        {
          entSeq: 2,
          japanese: ["火"],
          reading: ["ひ"],
          romaji: "hi",
          meanings: ["fire"],
        },
        { wordId: "2", mastery: 90, correctCount: 5, wrongCount: 0, lastSeenAt: new Date().toISOString() }
      ),
    ]
    const threats = filterVocabularyCatalog(entries, "THREATS")
    expect(threats.some((e) => e.wordId === "1")).toBe(true)
    expect(threats.some((e) => e.wordId === "2")).toBe(false)
  })
})

describe("playerStatProgressionSystem", () => {
  it("increments vocabulary on vocab quest", () => {
    const deltas = statDeltasForQuest({
      id: "q",
      type: "VOCABULARY",
      title: "",
      description: "",
      difficulty: "EASY",
      rewards: { xp: 1 },
      objectives: [],
    })
    const next = applyStatDeltas(
      {
        vocabulary: 0,
        grammar: 0,
        listening: 0,
        speaking: 0,
        confidence: 0,
        intelligence: 0,
        consistency: 0,
      },
      deltas
    )
    expect(next.vocabulary).toBe(2)
  })
})
