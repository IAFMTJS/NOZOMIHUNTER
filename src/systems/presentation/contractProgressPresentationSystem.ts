import type { QuestContract } from "@/contracts/quest-contract"

export interface ContractProgressViewModel {
  recoveredPercent: number
  fragmentLabel: string
  objectiveLine: string
}

export function shouldShowContractProgress(quest: QuestContract): boolean {
  return (
    (quest.narrativeTier === "MAIN" || quest.narrativeTier === "SIDE") &&
    quest.objectives.length > 0
  )
}

export function buildContractProgressView(quest: QuestContract): ContractProgressViewModel {
  const objectives = quest.objectives ?? []
  const total = objectives.reduce((s, o) => s + o.requiredProgress, 0)
  const current = objectives.reduce((s, o) => s + o.currentProgress, 0)
  const recoveredPercent =
    total > 0 ? Math.min(100, Math.round((current / total) * 100)) : 0
  const active = objectives.find((o) => !o.completed) ?? objectives[objectives.length - 1]

  return {
    recoveredPercent,
    fragmentLabel: `${objectives.filter((o) => o.completed).length}/${objectives.length} fragments`,
    objectiveLine: active?.description ?? "Investigate transmission",
  }
}
