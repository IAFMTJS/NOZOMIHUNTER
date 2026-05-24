import { kanaToRomaji } from "./kanaRomaji"
import { normalizeRomaji } from "./normalize"
import type { CuratedWordSource } from "@/systems/vocabulary/vocabularyCatalogSystem"

export interface LearnerWordParts {
  japanese: string
  reading: string
  romaji: string
  meaning: string
}

export function deriveRomajiFromReading(reading: string, explicit?: string): string {
  if (explicit) return normalizeRomaji(explicit)
  const fromKana = kanaToRomaji(reading)
  return fromKana ? normalizeRomaji(fromKana) : reading
}

export function learnerPartsFromCurated(source: CuratedWordSource): LearnerWordParts {
  const japanese = source.japanese[0] ?? ""
  const reading = source.reading[0] ?? ""
  const romaji = deriveRomajiFromReading(reading, source.romaji)
  return {
    japanese,
    reading,
    romaji,
    meaning: source.meanings[0] ?? "",
  }
}

export function formatLearnerTriple(parts: LearnerWordParts): string {
  const mid = parts.romaji || parts.reading
  return `${parts.japanese} • ${mid} • ${parts.meaning}`
}

export function learnerPartsFromEncounterWord(word: {
  japanese: string
  reading?: string
  romaji?: string
  meanings?: string[]
  meaning?: string
}): LearnerWordParts {
  const reading = word.reading ?? ""
  return {
    japanese: word.japanese,
    reading,
    romaji: deriveRomajiFromReading(reading, word.romaji),
    meaning: word.meanings?.[0] ?? word.meaning ?? "",
  }
}

export function learnerPartsFromExtractionRow(
  row: {
    japanese: string
    reading?: string
    romaji?: string
    meaning: string
  }
): LearnerWordParts {
  return learnerPartsFromEncounterWord(row)
}
