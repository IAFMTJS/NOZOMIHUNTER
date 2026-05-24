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
import { learnerPartsFromEncounterWord } from "@/services/jmdict/learnerFormat"
import { eventBus } from "@/systems/events/eventBus"
import { buildTrainingQuest, isTrainingQuest } from "@/systems/training/trainingMissionSystem"
import { buildQuestRewards } from "@/systems/quests/questRewardFactory"
import { generateQuestForChannel } from "@/systems/quests/questChannelSystem"
import type { PlayerContract } from "@/contracts/player-contract"

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

describe("learnerFormat", () => {
  it("maps encounter words to triple parts", () => {
    const parts = learnerPartsFromEncounterWord({
      japanese: "水",
      reading: "みず",
      romaji: "mizu",
      meanings: ["water"],
    })
    expect(parts).toEqual({
      japanese: "水",
      reading: "みず",
      romaji: "mizu",
      meaning: "water",
    })
  })
})

describe("eventBus", () => {
  it("off removes a handler", () => {
    let count = 0
    const handler = () => {
      count += 1
    }
    eventBus.on("test_off", handler)
    eventBus.emit("test_off")
    expect(count).toBe(1)
    eventBus.off("test_off", handler)
    eventBus.emit("test_off")
    expect(count).toBe(1)
  })
})

describe("trainingMissionSystem", () => {
  it("excludes training quests from contract catalog", () => {
    const training = buildTrainingQuest("vocabulary", 3)
    expect(isTrainingQuest(training)).toBe(true)
    const catalog = buildContractCatalog([
      training,
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
    ])
    expect(catalog.dailyQuests.map((q) => q.id)).toEqual(["d1"])
  })
})

describe("questChannelSystem", () => {
  const stubPlayer = {
    id: "p1",
    level: 10,
    progression: { unlockedSystems: ["system:listening"], unlockedDungeons: [], titles: [] },
  } as PlayerContract

  it("applies SIDE rewards on side channel", () => {
    const quest = generateQuestForChannel("side", stubPlayer, [])
    expect(quest.rewards.xp).toBe(buildQuestRewards(10, "SIDE").xp)
    expect(quest.narrativeTier).toBe("SIDE")
  })

  it("SIDE reward XP is below MAIN at same level", () => {
    const side = buildQuestRewards(10, "SIDE").xp
    const main = buildQuestRewards(10, "MAIN").xp
    expect(side).toBeLessThan(main)
  })
})
