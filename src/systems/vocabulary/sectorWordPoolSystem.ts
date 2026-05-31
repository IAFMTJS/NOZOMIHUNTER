import type { SectorId } from "@/contracts/sector-contract"
import { pickVocabularyWords } from "@/systems/quests/vocabularyEncounterSystem"
import type { VocabularyWordContract } from "@/contracts/encounter-contract"

const POOL_TAGS: Record<string, string[]> = {
  "sector-01-n5-core": ["N5"],
  "sector-02-listening": ["N5", "N4"],
  "sector-03-n4-vocab": ["N4"],
  "sector-04-n3-kanji": ["N3"],
  "sector-05-mixed": ["N3", "N2"],
  "sector-06-reading": ["N2"],
  "sector-07-endgame": ["N1", "N2"],
}

const SECTOR_TO_POOL: Record<string, string> = {
  "sector-01": "sector-01-n5-core",
  "sector-02": "sector-02-listening",
  "sector-03": "sector-03-n4-vocab",
  "sector-04": "sector-04-n3-kanji",
  "sector-05": "sector-05-mixed",
  "sector-06": "sector-06-reading",
  "sector-07": "sector-07-endgame",
}

export function resolveWordPoolId(sectorId?: SectorId | string): string | null {
  if (!sectorId) return null
  return SECTOR_TO_POOL[sectorId] ?? null
}

export function pickFromSectorPool(
  count: number,
  sectorId?: SectorId | string
): VocabularyWordContract[] {
  const poolId = resolveWordPoolId(sectorId)
  if (!poolId) return pickVocabularyWords(count)
  const tags = POOL_TAGS[poolId]
  if (!tags?.length) return pickVocabularyWords(count)
  const words = pickVocabularyWords(count * 3)
  const filtered = words.filter((w) => {
    const jlpt = (w as VocabularyWordContract & { jlpt?: string }).jlpt
    return !jlpt || tags.some((t) => jlpt === t)
  })
  if (filtered.length >= count) return filtered.slice(0, count)
  return pickVocabularyWords(count)
}
