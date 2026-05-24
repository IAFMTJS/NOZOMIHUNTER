import type { WordMasteryContract } from "@/contracts/vocabulary-contract"
import { BREW_CONFIG } from "@/config/brewConfig"
import { computeWordInstability, hasMemoryDecay } from "./memoryDecaySystem"
import type { VocabularyThreatLevel } from "@/contracts/vocabulary-contract"
import {
  resolveVocabularyThreat,
} from "./vocabularyThreatSystem"

export type VocabularyCatalogTab = "THREATS" | "CONQUERED" | "ALL"

export interface VocabularyCatalogEntry {
  entSeq: number
  wordId: string
  japanese: string
  reading: string
  romaji: string
  meaning: string
  mastery: number
  instability: number
  threat: VocabularyThreatLevel
}

export interface CuratedWordSource {
  entSeq: number
  japanese: string[]
  reading: string[]
  romaji?: string
  meanings: string[]
}

export function mapCuratedToCatalogEntry(
  source: CuratedWordSource,
  masteryRow: WordMasteryContract | undefined
): VocabularyCatalogEntry {
  const wordId = String(source.entSeq)
  const reading = source.reading[0] ?? ""
  const romaji =
    source.romaji ?? reading /* kana fallback until romaji on all rows */
  return {
    entSeq: source.entSeq,
    wordId,
    japanese: source.japanese[0] ?? "",
    reading,
    romaji,
    meaning: source.meanings[0] ?? "",
    mastery: masteryRow?.mastery ?? 0,
    instability: computeWordInstability(masteryRow),
    threat: resolveVocabularyThreat(
      wordId,
      {},
      computeWordInstability(masteryRow)
    ),
  }
}

const THREAT_ORDER: Record<VocabularyThreatLevel, number> = {
  SECTOR_CRITICAL: 0,
  CRITICAL: 1,
  ELEVATED: 2,
  ROUTINE: 3,
}

export function filterVocabularyCatalog(
  entries: VocabularyCatalogEntry[],
  tab: VocabularyCatalogTab
): VocabularyCatalogEntry[] {
  const learned = BREW_CONFIG.LEARNED_MASTERY_THRESHOLD

  let list = entries
  if (tab === "CONQUERED") {
    list = entries.filter((e) => e.mastery >= learned)
  } else if (tab === "THREATS") {
    list = entries.filter(
      (e) =>
        e.mastery < learned &&
        (e.mastery > 0 || hasMemoryDecay(e.instability) || e.threat !== "ROUTINE")
    )
    if (list.length === 0) {
      list = entries.filter((e) => e.mastery < learned)
    }
  }

  return [...list].sort((a, b) => {
    if (tab === "THREATS") {
      const tier = THREAT_ORDER[a.threat] - THREAT_ORDER[b.threat]
      if (tier !== 0) return tier
      return b.instability - a.instability
    }
    if (tab === "CONQUERED") return b.mastery - a.mastery
    return a.japanese.localeCompare(b.japanese)
  })
}
