import type { QuestContract } from "@/contracts/quest-contract"
import { resolveQuestGameMode } from "@/systems/gameModes/gameModeSystem"

export function isQuestEncounterPlayable(quest: QuestContract): boolean {
  const mode = resolveQuestGameMode(quest)

  switch (mode) {
    case "TERMINAL_BREACH":
      return Boolean(quest.terminalBreachEncounter)
    case "KANJI_SURGERY":
      return (quest.kanjiSurgeryEncounter?.length ?? 0) > 0
    case "MEMORY_CASCADE":
      return Boolean(quest.memoryCascadeEncounter)
    case "MEMORY_GRID":
      return Boolean(quest.memoryGridEncounter?.cards.length)
    case "ECHO_LISTENING":
      return Boolean(quest.echoListeningEncounter?.chunks.length)
    case "SHADOW_TYPING":
    case "SURVIVAL_VOCAB":
    case "KANA_DASH":
      return (quest.vocabularyEncounter?.words.length ?? 0) > 0
    case "SEMANTIC_NETWORK":
      return Boolean(quest.semanticNetworkEncounter)
    case "SIGNAL_CALIBRATION":
    case "LOST_TRANSMISSION":
      return (quest.listeningEncounter?.fragments.length ?? 0) > 0
    case "SHADOW_ECHO":
      return (quest.speechEncounter?.phrases.length ?? 0) > 0
    case "GHOST_INTERROGATION":
    case "DEEP_COVER":
    case "PANIC_CHANNEL":
      return (quest.conversationEncounter?.messages.length ?? 0) > 0
    default:
      break
  }

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
