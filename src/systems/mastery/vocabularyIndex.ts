import type { VocabularyEntryContract } from "@/contracts/vocabulary-contract"
import { buildSearchText } from "@/services/jmdict/normalize"

export interface VocabularyIndex {
  entries: VocabularyEntryContract[]
  byId: Map<string, VocabularyEntryContract>
  searchBlob: Map<string, string>
}

export function buildVocabularyIndex(
  entries: VocabularyEntryContract[]
): VocabularyIndex {
  const byId = new Map<string, VocabularyEntryContract>()
  const searchBlob = new Map<string, string>()

  for (const entry of entries) {
    byId.set(entry.id, entry)
    searchBlob.set(entry.id, buildSearchText(entry))
  }

  return { entries, byId, searchBlob }
}

export function mergeVocabularyIndexes(
  base: VocabularyIndex,
  extra: VocabularyEntryContract[]
): VocabularyIndex {
  const merged = new Map(base.byId)
  for (const entry of extra) {
    merged.set(entry.id, entry)
  }
  return buildVocabularyIndex([...merged.values()])
}
