import type {
  DungeonRunContract,
  DungeonRunSummary,
  DungeonWordExtractionEntry,
} from "@/contracts/dungeon-contract"

export function masteryFantasyLabel(score: number): DungeonWordExtractionEntry["fantasyState"] {
  if (score >= 90) return "bound"
  if (score >= 75) return "sealed"
  if (score >= 55) return "stabilized"
  if (score >= 35) return "scanned"
  if (score >= 20) return "unstable"
  return "unstable"
}

export function buildDungeonRunSummary(
  run: DungeonRunContract,
  masteryByWord: Map<string, number>,
  lookup: (id: string) => { japanese: string; meanings: string[] } | null,
  bossName?: string
): DungeonRunSummary {
  const ids = run.stabilizedWordIds ?? []
  const entries: DungeonWordExtractionEntry[] = ids.map((wordId) => {
    const entry = lookup(wordId)
    const mastery = masteryByWord.get(wordId) ?? 0
    const gloss = entry?.meanings[0] ?? wordId
    const label = entry ? `${entry.japanese} · ${gloss}` : gloss
    return {
      wordId,
      label,
      fantasyState: masteryFantasyLabel(mastery),
    }
  })

  const wordsBound = entries.filter((e) =>
    ["bound", "sealed", "stabilized"].includes(e.fantasyState)
  )
  const weakSignals = entries.filter((e) => e.fantasyState === "unstable")

  return {
    wordsBound,
    weakSignals,
    bossSealLabel: bossName ? `${bossName} Fragment` : undefined,
    techniqueLabel:
      run.pendingExtractionChoice === "PUSH_DEEPER"
        ? "Counter Seal (trial)"
        : undefined,
    runScore: run.runScore ?? 0,
  }
}
