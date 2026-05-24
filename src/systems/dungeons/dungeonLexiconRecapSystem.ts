import type { QuestContract } from "@/contracts/quest-contract"
import type { DungeonRunContract } from "@/contracts/dungeon-contract"

export interface ExtractionMasteryEntry {
  wordId: string
  label: string
  mastery: number
}

export function extractEncounterWordIds(quest: QuestContract): string[] {
  const ids = new Set<string>()
  quest.vocabularyEncounter?.words.forEach((w) => ids.add(w.id))
  quest.listeningEncounter?.fragments.forEach((f) => ids.add(f.id))
  quest.speechEncounter?.phrases.forEach((p) => ids.add(p.id))
  return [...ids]
}

export function appendStabilizedWordIds(
  run: DungeonRunContract,
  wordIds: string[]
): DungeonRunContract {
  if (wordIds.length === 0) return run
  const existing = new Set(run.stabilizedWordIds ?? [])
  wordIds.forEach((id) => existing.add(id))
  return { ...run, stabilizedWordIds: [...existing] }
}

export function buildExtractionMasteryRecap(
  wordIds: string[],
  masteryByWord: Map<string, number>,
  lookup: (id: string) => { japanese: string; meanings: string[] } | null
): ExtractionMasteryEntry[] {
  return wordIds
    .map((wordId) => {
      const entry = lookup(wordId)
      const mastery = masteryByWord.get(wordId) ?? 0
      const gloss = entry?.meanings[0] ?? wordId
      const label = entry ? `${entry.japanese} · ${gloss}` : gloss
      return { wordId, label, mastery }
    })
    .sort((a, b) => b.mastery - a.mastery)
    .slice(0, 8)
}
