import type { JmdictEntry } from "@/services/jmdict/parser"

const masteryMap = new Map<string, number>()

export function recordWordMastery(wordId: string, score: number): void {
  const current = masteryMap.get(wordId) ?? 0
  masteryMap.set(wordId, Math.min(100, current + score))
}

export function getMastery(wordId: string): number {
  return masteryMap.get(wordId) ?? 0
}

export function searchEntries(
  entries: JmdictEntry[],
  query: string
): JmdictEntry[] {
  const q = query.toLowerCase()
  return entries.filter(
    (e) =>
      e.japanese.includes(query) ||
      e.romaji.toLowerCase().includes(q) ||
      e.english.toLowerCase().includes(q)
  )
}
