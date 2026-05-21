import type { VocabularyEntryContract } from "@/contracts/vocabulary-contract"
import { JMDICT_MASTERY } from "@/config/jmdictConfig"
import type { VocabularyIndex } from "./vocabularyIndex"

export interface PickWordsOptions {
  count: number
  masteryByWord: Map<string, number>
  excludeIds?: Set<string>
  playerLevel?: number
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j]!, copy[i]!]
  }
  return copy
}

function masteryWeight(mastery: number): number {
  return Math.max(1, 100 - mastery)
}

/**
 * Prefer high-frequency, low-mastery words for encounters.
 */
export function pickWordsByFrequency(
  index: VocabularyIndex,
  options: PickWordsOptions
): VocabularyEntryContract[] {
  const { count, masteryByWord, excludeIds = new Set() } = options
  const poolSize = Math.min(
    index.entries.length,
    count * JMDICT_MASTERY.ENCOUNTER_PICK_POOL_MULTIPLIER
  )

  const candidates = index.entries
    .filter((e) => !excludeIds.has(e.id))
    .sort((a, b) => a.frequencyTier - b.frequencyTier)
    .slice(0, poolSize)

  const weighted = shuffle(candidates).sort((a, b) => {
    const wa =
      masteryWeight(masteryByWord.get(a.id) ?? 0) / Math.max(1, a.frequencyTier)
    const wb =
      masteryWeight(masteryByWord.get(b.id) ?? 0) / Math.max(1, b.frequencyTier)
    return wb - wa
  })

  return weighted.slice(0, Math.min(count, weighted.length))
}
