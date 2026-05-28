import type { QuestContract } from "@/contracts/quest-contract"
import { hasActivePreparationPhase } from "@/systems/vocabulary/vocabularyPreparationOrchestrator"
import type { HubView } from "./hubTypes"

export function questReadyForHunt(quest: QuestContract): boolean {
  if (hasActivePreparationPhase(quest)) return false
  switch (quest.type) {
    case "VOCABULARY":
      return (quest.vocabularyEncounter?.words.length ?? 0) > 0
    case "CONVERSATION":
      return (quest.conversationEncounter?.messages.length ?? 0) > 0
    case "SPEECH":
      return (quest.speechEncounter?.phrases.length ?? 0) > 0
    case "LISTENING":
      return (quest.listeningEncounter?.fragments.length ?? 0) > 0
    default:
      return false
  }
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
