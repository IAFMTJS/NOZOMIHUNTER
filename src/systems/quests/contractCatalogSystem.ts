import type { QuestContract, QuestNarrativeTier } from "@/contracts/quest-contract"
import { overlayCatalogMetadata } from "@/config/missionCatalogMetadata"

export interface ContractCatalogView {
  mainStory: QuestContract | null
  sideQuests: QuestContract[]
  completed: QuestContract[]
}

function inferTier(quest: QuestContract): QuestNarrativeTier {
  if (quest.narrativeTier) return quest.narrativeTier
  if (quest.isTutorial) return "MAIN"
  if (quest.type === "LISTENING" || quest.difficulty === "HARD") return "MAIN"
  return "SIDE"
}

export function withNarrativeTier(quest: QuestContract): QuestContract {
  return overlayCatalogMetadata({ ...quest, narrativeTier: inferTier(quest) })
}

export function buildContractCatalog(
  quests: QuestContract[],
  completedIds: string[] = []
): ContractCatalogView {
  const active = quests
    .filter((q) => !completedIds.includes(q.id))
    .map(withNarrativeTier)
  const main = active.find((q) => inferTier(q) === "MAIN") ?? null
  const side = active.filter((q) => q.id !== main?.id && inferTier(q) === "SIDE")
  const completed = quests
    .filter((q) => completedIds.includes(q.id))
    .map(withNarrativeTier)

  return { mainStory: main, sideQuests: side, completed }
}

export function objectiveDisplayText(
  objective: QuestContract["objectives"][number]
): string {
  if (
    objective.hidden &&
    objective.currentProgress < (objective.revealAt ?? 1)
  ) {
    return "???"
  }
  return objective.description
}

export function isObjectiveRevealed(
  objective: QuestContract["objectives"][number]
): boolean {
  if (!objective.hidden) return true
  return objective.currentProgress >= (objective.revealAt ?? 1)
}
