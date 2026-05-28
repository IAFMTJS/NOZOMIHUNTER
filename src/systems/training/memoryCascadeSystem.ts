import { getCatalogEntries } from "@/systems/mastery/vocabularyCatalog"
import { toEncounterWord } from "@/services/jmdict/normalize"
import type {
  MemoryCascadeRoundContract,
  VocabularyWordContract,
} from "@/contracts/encounter-contract"

export function createMemoryCascadeRound(
  wordCount = 5
): MemoryCascadeRoundContract {
  const pool = [...getCatalogEntries()].sort(() => Math.random() - 0.5)
  const words: VocabularyWordContract[] = pool
    .slice(0, wordCount)
    .map((e) => toEncounterWord(e))
  const intruder = pool[wordCount]
  const intruderId = intruder ? toEncounterWord(intruder).id : null
  return { words, intruderId, revealed: false }
}

export function checkMemoryCascadeAnswer(
  round: MemoryCascadeRoundContract,
  selectedId: string
): boolean {
  if (!round.intruderId) return false
  return selectedId === round.intruderId
}
