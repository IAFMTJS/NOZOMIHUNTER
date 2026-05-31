import type { QuestContract } from "@/contracts/quest-contract"
import { hasActivePreparationPhase } from "@/systems/vocabulary/vocabularyPreparationOrchestrator"
import { isQuestEncounterPlayable } from "@/systems/quests/questPlayabilitySystem"
import type { HubView } from "./hubTypes"

export function questReadyForHunt(quest: QuestContract): boolean {
  if (hasActivePreparationPhase(quest)) return false
  return isQuestEncounterPlayable(quest)
}

export function defaultHubView(
  activeDungeon: QuestContract | undefined,
  huntQuest: QuestContract | undefined
): HubView {
  if (activeDungeon) return "sector"
  if (huntQuest) return "hunt"
  return "menu"
}

export function resolveHubHuntQuest(
  regularQuests: QuestContract[],
  activeQuests: QuestContract[],
  selectedQuestId: string | null | undefined,
  fallback?: QuestContract
): QuestContract | undefined {
  if (selectedQuestId) {
    const fromRegular = regularQuests.find((q) => q.id === selectedQuestId)
    if (fromRegular) return fromRegular
    const fromActive = activeQuests.find((q) => q.id === selectedQuestId)
    if (fromActive) return fromActive
  }
  return fallback ?? regularQuests.find(questReadyForHunt) ?? regularQuests[0]
}
