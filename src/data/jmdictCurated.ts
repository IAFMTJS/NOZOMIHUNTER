import type { VocabularyEntryContract } from "@/contracts/vocabulary-contract"
import { JMDICT_CURATED_GENERATED } from "@/data/jmdictCurated.generated"

/**
 * In-memory curated vocabulary (JMdict-sourced ent_seq + readings).
 * Regenerate: `npm run build:curated -- data/JMdict_e.xml` or `-- --download`
 */
export const JMDICT_CURATED: VocabularyEntryContract[] = JMDICT_CURATED_GENERATED
