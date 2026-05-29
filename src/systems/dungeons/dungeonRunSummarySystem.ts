import type {
  DungeonRunContract,
  DungeonRunSummary,
  DungeonWordExtractionEntry,
} from "@/contracts/dungeon-contract"
import { resolveMasterForRun } from "./dungeonMasterSystem"

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

  const master = resolveMasterForRun(run)
  const displayBoss = bossName ?? master.displayName

  const runScore = run.runScore ?? 0
  const peakCorruption = Math.round(
    run.sectorCorruption ?? run.threat?.corruptionPressure ?? 0
  )
  const completed = run.completedNodeIds?.length ?? 0
  const totalNodes = run.routeGraph
    ? Object.keys(run.routeGraph.nodes).length
    : completed

  return {
    wordsBound,
    weakSignals,
    bossSealLabel: `${displayBoss} Fragment`,
    techniqueLabel:
      run.pendingExtractionChoice === "PUSH_DEEPER"
        ? "Counter Seal (trial)"
        : master.perfectClearReward.techniqueLabel,
    runScore,
    runGrade: computeRunGrade(runScore, peakCorruption),
    peakCorruption,
    sectorsCleared: `${completed}/${Math.max(1, totalNodes)}`,
  }
}

export function computeRunGrade(
  runScore: number,
  peakCorruption: number
): "S" | "A" | "B" | "C" {
  if (runScore >= 80 && peakCorruption < 60) return "S"
  if (runScore >= 55 && peakCorruption < 75) return "A"
  if (runScore >= 30) return "B"
  return "C"
}
