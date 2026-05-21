import type { VocabularyEntryContract } from "@/contracts/vocabulary-contract"
import { normalizeAnswer } from "@/services/jmdict/normalize"
import type { VocabularyIndex } from "./vocabularyIndex"

export function searchVocabulary(
  index: VocabularyIndex,
  query: string,
  limit = 20
): VocabularyEntryContract[] {
  const q = normalizeAnswer(query)
  if (!q) return []

  const hits: VocabularyEntryContract[] = []
  for (const entry of index.entries) {
    const blob = index.searchBlob.get(entry.id) ?? ""
    if (
      entry.japanese.some((k) => k.includes(query)) ||
      blob.includes(q)
    ) {
      hits.push(entry)
      if (hits.length >= limit) break
    }
  }

  return hits
}
