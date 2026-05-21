import type { VocabularyEntryContract } from "@/contracts/vocabulary-contract"
import {
  inferJlptFromFrequencyTier,
  JMDICT_FREQUENCY_TIERS,
} from "@/config/jmdictConfig"
import { containsKana, kanaToRomaji } from "./kanaRomaji"

export function normalizeAnswer(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ")
}

export function normalizeRomaji(value: string): string {
  return normalizeAnswer(value).replace(/[āáà]/g, "a")
}

/** JMDict reb readings are kana; curated rows may already be latin romaji. */
export function readingToRomaji(reading: string): string {
  const trimmed = reading.trim()
  if (!trimmed) return ""
  if (containsKana(trimmed)) {
    return normalizeRomaji(kanaToRomaji(trimmed))
  }
  return normalizeRomaji(trimmed)
}

export function normalizeJapanese(value: string): string {
  return value.trim().normalize("NFKC")
}

export function normalizeMeanings(glosses: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const g of glosses) {
    const n = normalizeAnswer(g)
    if (!n || seen.has(n)) continue
    seen.add(n)
    out.push(n)
  }
  return out
}

export function priorityTagToTier(tag: string | undefined): number {
  if (!tag) return JMDICT_FREQUENCY_TIERS.UNKNOWN
  const key = tag.replace(/[^a-z0-9]/gi, "").toLowerCase()
  const map: Record<string, number> = {
    ichi1: JMDICT_FREQUENCY_TIERS.ICHI1,
    ichi2: JMDICT_FREQUENCY_TIERS.ICHI2,
    news1: JMDICT_FREQUENCY_TIERS.NEWS1,
    news2: JMDICT_FREQUENCY_TIERS.NEWS2,
    spec1: JMDICT_FREQUENCY_TIERS.SPEC1,
    spec2: JMDICT_FREQUENCY_TIERS.SPEC2,
    gai1: JMDICT_FREQUENCY_TIERS.GAI1,
    gai2: JMDICT_FREQUENCY_TIERS.GAI2,
  }
  return map[key] ?? JMDICT_FREQUENCY_TIERS.UNKNOWN
}

export function buildSearchText(entry: Pick<
  VocabularyEntryContract,
  "japanese" | "reading" | "meanings" | "romaji"
>): string {
  return [
    ...entry.japanese,
    ...entry.reading,
    entry.romaji,
    ...entry.meanings,
  ]
    .join(" ")
    .toLowerCase()
}

export function toVocabularyEntry(input: {
  entSeq: number
  japanese: string[]
  reading: string[]
  meanings: string[]
  jlpt?: string
  frequencyTier?: number
  /** Override when kana→romaji heuristic differs from learner-facing spelling. */
  romaji?: string
}): VocabularyEntryContract {
  const japanese = input.japanese.map(normalizeJapanese).filter(Boolean)
  const reading = input.reading.map(normalizeJapanese).filter(Boolean)
  const meanings = normalizeMeanings(input.meanings)
  const romaji = input.romaji
    ? normalizeRomaji(input.romaji)
    : readingToRomaji(reading[0] ?? "")
  const frequencyTier =
    input.frequencyTier ?? JMDICT_FREQUENCY_TIERS.UNKNOWN
  const jlpt = input.jlpt ?? inferJlptFromFrequencyTier(frequencyTier)

  return {
    id: String(input.entSeq),
    entSeq: input.entSeq,
    japanese: japanese.length ? japanese : reading,
    reading: reading.length ? reading : japanese,
    meanings: meanings.length ? meanings : ["unknown"],
    romaji,
    jlpt,
    frequencyTier,
  }
}

export function formatKanaRomajiLabel(
  entry: Pick<VocabularyEntryContract, "reading" | "romaji">
): string {
  const kana = entry.reading.find(containsKana) ?? ""
  if (kana) return `${kana} (${entry.romaji})`
  return entry.romaji
}

export function toEncounterWord(
  entry: VocabularyEntryContract
): {
  id: string
  japanese: string
  reading: string
  romaji: string
  meanings: string[]
} {
  const japanese = entry.japanese[0] ?? entry.reading[0] ?? ""
  const reading =
    entry.reading.find(containsKana) ?? entry.reading[0] ?? ""
  const romaji = entry.romaji?.trim()
  if (!japanese || !romaji) {
    throw new Error(
      `Vocabulary entry ${entry.id} must include both japanese and romaji`
    )
  }
  return {
    id: entry.id,
    japanese,
    reading,
    romaji,
    meanings: entry.meanings,
  }
}
