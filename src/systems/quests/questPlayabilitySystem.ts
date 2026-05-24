import type { QuestContract } from "@/contracts/quest-contract"

export function isQuestEncounterPlayable(quest: QuestContract): boolean {
  switch (quest.type) {
    case "VOCABULARY":
      return (quest.vocabularyEncounter?.words.length ?? 0) > 0
    case "CONVERSATION":
      return (quest.conversationEncounter?.messages.length ?? 0) > 0
    case "SPEECH":
      return (quest.speechEncounter?.phrases.length ?? 0) > 0
    case "LISTENING":
      return (quest.listeningEncounter?.fragments.length ?? 0) > 0
    case "DUNGEON":
      return Boolean(quest.dungeonRun)
    default:
      return false
  }
}

export const MISSION_DATA_CORRUPTED_COPY =
  "MISSION DATA CORRUPTED — Registry reconstruction in progress."
