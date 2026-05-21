import type { VocabularyWordContract } from "@/contracts/encounter-contract"
import { JMDICT_CURATED } from "@/data/jmdictCurated"
import { toEncounterWord } from "@/services/jmdict/normalize"

/** @deprecated Use JMDICT_CURATED via vocabularyCatalog. Kept for legacy imports. */
export const VOCABULARY_SEED: VocabularyWordContract[] =
  JMDICT_CURATED.map(toEncounterWord)
