import { FEATURE_FLAGS } from "@/config/features"
import { JMDICT_CURATED } from "@/data/jmdictCurated"
import type { VocabularyEntryContract } from "@/contracts/vocabulary-contract"
import { setReadingAnnotationCatalog } from "@/services/jmdict/readingAnnotation"
import {
  buildVocabularyIndex,
  mergeVocabularyIndexes,
  type VocabularyIndex,
} from "./vocabularyIndex"

let catalog: VocabularyIndex | null = null

export function getCuratedVocabularyEntries(): VocabularyEntryContract[] {
  return JMDICT_CURATED
}

export function initVocabularyCatalog(
  entries: VocabularyEntryContract[] = JMDICT_CURATED
): VocabularyIndex {
  catalog = buildVocabularyIndex(
    FEATURE_FLAGS.JMDICT_ENGINE ? entries : JMDICT_CURATED
  )
  setReadingAnnotationCatalog(catalog.entries)
  return catalog
}

export function extendVocabularyCatalog(
  extra: VocabularyEntryContract[]
): VocabularyIndex {
  const base = getVocabularyCatalog()
  catalog = mergeVocabularyIndexes(base, extra)
  setReadingAnnotationCatalog(catalog.entries)
  return catalog
}

export function getVocabularyCatalog(): VocabularyIndex {
  if (!catalog) return initVocabularyCatalog()
  return catalog
}

/** All entries in the active catalog (curated + optional DB merge). */
export function getCatalogEntries(): VocabularyEntryContract[] {
  return getVocabularyCatalog().entries
}

export function getCatalogEntryById(
  wordId: string
): VocabularyEntryContract | undefined {
  return getVocabularyCatalog().byId.get(wordId)
}

export function getCatalogEntryByEntSeq(
  entSeq: number
): VocabularyEntryContract | undefined {
  return getCatalogEntryById(String(entSeq))
}

/** Random subset from the active catalog (curated + DB). */
export function sampleCatalogEntries(
  count: number
): VocabularyEntryContract[] {
  const pool = [...getCatalogEntries()].sort(() => Math.random() - 0.5)
  return pool.slice(0, Math.min(count, pool.length))
}

export function resetVocabularyCatalogForTests(): void {
  catalog = null
  setReadingAnnotationCatalog(JMDICT_CURATED)
}
