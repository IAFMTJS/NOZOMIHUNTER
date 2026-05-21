import { initVocabularyCatalog, extendVocabularyCatalog } from "@/systems/mastery/vocabularyCatalog"
import { hydrateMastery } from "@/systems/mastery/masterySystem"
import {
  loadVocabularyEntries,
  loadWordMastery,
} from "@/services/supabase/vocabularyRepository"
import { createClient } from "@/lib/supabase/client"

let vocabularyReady = false

export async function ensureVocabularyEngine(userId: string): Promise<void> {
  if (vocabularyReady) return

  initVocabularyCatalog()

  const supabase = createClient()
  if (supabase) {
    try {
      const [entries, mastery] = await Promise.all([
        loadVocabularyEntries(),
        loadWordMastery(userId),
      ])
      if (entries.length) extendVocabularyCatalog(entries)
      hydrateMastery(mastery)
    } catch {
      hydrateMastery([])
    }
  }

  vocabularyReady = true
}

export function resetVocabularyEngineForTests(): void {
  vocabularyReady = false
}
