import { FEATURE_FLAGS } from "@/config/features"
import { JMDICT_CURATED } from "@/data/jmdictCurated"
import type { VocabularyEntryContract } from "@/contracts/vocabulary-contract"
import {
  buildVocabularyIndex,
  mergeVocabularyIndexes,
  type VocabularyIndex,
} from "./vocabularyIndex"

let catalog: VocabularyIndex | null = null

export function initVocabularyCatalog(
  entries: VocabularyEntryContract[] = JMDICT_CURATED
): VocabularyIndex {
  catalog = buildVocabularyIndex(
    FEATURE_FLAGS.JMDICT_ENGINE ? entries : JMDICT_CURATED
  )
  return catalog
}

export function extendVocabularyCatalog(
  extra: VocabularyEntryContract[]
): VocabularyIndex {
  const base = getVocabularyCatalog()
  catalog = mergeVocabularyIndexes(base, extra)
  return catalog
}

export function getVocabularyCatalog(): VocabularyIndex {
  if (!catalog) return initVocabularyCatalog()
  return catalog
}
