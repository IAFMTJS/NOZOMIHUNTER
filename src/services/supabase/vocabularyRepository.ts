import { createClient } from "@/lib/supabase/client"
import type { VocabularyEntryContract, WordMasteryContract } from "@/contracts/vocabulary-contract"
import { readingToRomaji } from "@/services/jmdict/normalize"

function requireClient() {
  const supabase = createClient()
  if (!supabase) {
    throw new Error("Supabase is not configured")
  }
  return supabase
}

function rowToEntry(row: {
  id: string
  ent_seq: number
  japanese: string[]
  reading: string[]
  meanings: string[]
  romaji: string
  jlpt: string | null
  frequency_tier: number
}): VocabularyEntryContract {
  return {
    id: row.id,
    entSeq: row.ent_seq,
    japanese: row.japanese,
    reading: row.reading,
    meanings: row.meanings,
    romaji: readingToRomaji(row.romaji),
    jlpt: row.jlpt ?? undefined,
    frequencyTier: row.frequency_tier,
  }
}

export async function loadVocabularyEntries(
  limit = 500
): Promise<VocabularyEntryContract[]> {
  const supabase = requireClient()
  const { data, error } = await supabase
    .from("vocabulary_entries")
    .select(
      "id, ent_seq, japanese, reading, meanings, romaji, jlpt, frequency_tier"
    )
    .order("frequency_tier", { ascending: true })
    .limit(limit)

  if (error || !data?.length) return []
  return data.map(rowToEntry)
}

export async function loadWordMastery(
  userId: string
): Promise<WordMasteryContract[]> {
  const supabase = requireClient()
  const { data, error } = await supabase
    .from("word_mastery")
    .select("word_id, mastery, correct_count, wrong_count, last_seen_at")
    .eq("user_id", userId)

  if (error || !data) return []

  return data.map((row) => ({
    wordId: row.word_id,
    mastery: row.mastery,
    correctCount: row.correct_count,
    wrongCount: row.wrong_count,
    lastSeenAt: row.last_seen_at,
  }))
}

export async function markWordAsLearned(
  userId: string,
  wordId: string,
  threshold: number
): Promise<void> {
  const supabase = requireClient()
  const { data: existing } = await supabase
    .from("word_mastery")
    .select("correct_count, wrong_count, last_seen_at")
    .eq("user_id", userId)
    .eq("word_id", wordId)
    .maybeSingle()

  await supabase.from("word_mastery").upsert({
    user_id: userId,
    word_id: wordId,
    mastery: threshold,
    correct_count: existing?.correct_count ?? 0,
    wrong_count: existing?.wrong_count ?? 0,
    last_seen_at: existing?.last_seen_at ?? new Date().toISOString(),
  })
}

export async function upsertWordMastery(
  userId: string,
  row: WordMasteryContract
): Promise<void> {
  const supabase = requireClient()
  await supabase.from("word_mastery").upsert({
    user_id: userId,
    word_id: row.wordId,
    mastery: row.mastery,
    correct_count: row.correctCount,
    wrong_count: row.wrongCount,
    last_seen_at: row.lastSeenAt,
  })
}
