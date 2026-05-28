import { describe, expect, it } from "vitest"
import { JMDICT_CURATED } from "@/data/jmdictCurated"
import { initVocabularyCatalog, getCatalogEntries } from "@/systems/mastery/vocabularyCatalog"
import { toEncounterWord } from "@/services/jmdict/normalize"

describe("JMDICT_CURATED", () => {
  it("ships a substantial RPG + core JLPT pool", () => {
    expect(JMDICT_CURATED.length).toBeGreaterThanOrEqual(200)
  })

  it("uses real JMdict ent_seq ids and romaji for every entry", () => {
    for (const entry of JMDICT_CURATED) {
      expect(entry.entSeq).toBeGreaterThan(1000)
      expect(entry.id).toBe(String(entry.entSeq))
      expect(entry.romaji.length).toBeGreaterThan(0)
      expect(() => toEncounterWord(entry)).not.toThrow()
    }
  })

  it("indexes curated entries in vocabulary catalog", () => {
    initVocabularyCatalog()
    expect(getCatalogEntries().length).toBe(JMDICT_CURATED.length)
  })

  it("includes key RPG lemmas", () => {
    const kanji = new Set(
      JMDICT_CURATED.flatMap((e) => e.japanese.map((k) => k))
    )
    expect(kanji.has("狩人")).toBe(true)
    expect(kanji.has("結界")).toBe(true)
    expect(kanji.has("風")).toBe(true)
  })
})
