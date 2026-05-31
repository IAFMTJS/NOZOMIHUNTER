import type { QuestContract } from "@/contracts/quest-contract"
import { isKanjiSurgeryComplete } from "@/systems/training/kanjiSurgerySystem"
import { isMemoryGridComplete } from "@/systems/training/memoryGridSystem"
import {
  semanticNetworkComplete,
} from "@/systems/vocabulary/semanticNetworkSystem"
import { checkEchoReconstruction } from "@/systems/training/echoListeningSystem"

/** Whether the quest mounts a playable encounter payload. */
export function hasPlayableEncounterPayload(quest: QuestContract): boolean {
  return Boolean(
    quest.vocabularyEncounter?.words?.length ||
      quest.listeningEncounter?.fragments?.length ||
      quest.speechEncounter?.phrases?.length ||
      quest.conversationEncounter?.messages?.length ||
      quest.kanjiSurgeryEncounter?.length ||
      quest.memoryCascadeEncounter ||
      quest.memoryGridEncounter?.cards?.length ||
      quest.terminalBreachEncounter ||
      quest.echoListeningEncounter ||
      quest.semanticNetworkEncounter
  )
}

/** True when the active encounter payload is fully cleared. */
export function isEncounterPayloadComplete(quest: QuestContract): boolean {
  const vocab = quest.vocabularyEncounter
  if (vocab?.words.length) {
    return vocab.currentIndex >= vocab.words.length
  }

  const listen = quest.listeningEncounter
  if (listen?.fragments.length) {
    return listen.currentIndex >= listen.fragments.length
  }

  const speech = quest.speechEncounter
  if (speech?.phrases.length) {
    return speech.currentIndex >= speech.phrases.length
  }

  const conv = quest.conversationEncounter
  if (conv?.messages.length) {
    return conv.successfulExchanges >= conv.requiredExchanges
  }

  const kanji = quest.kanjiSurgeryEncounter
  if (kanji?.length) {
    return isKanjiSurgeryComplete(kanji)
  }

  const grid = quest.memoryGridEncounter
  if (grid?.cards.length) {
    return isMemoryGridComplete(grid)
  }

  const breach = quest.terminalBreachEncounter
  if (breach) {
    return breach.pathUnlocked
  }

  const echo = quest.echoListeningEncounter
  if (echo) {
    return checkEchoReconstruction(echo)
  }

  const semantic = quest.semanticNetworkEncounter
  if (semantic) {
    return semanticNetworkComplete(semantic.links, semantic.matchedLinkIds)
  }

  // Memory cascade completes via completeModeObjective (objectives only).
  if (quest.memoryCascadeEncounter) {
    return quest.objectives.every(
      (o) => o.hidden || o.currentProgress >= o.requiredProgress
    )
  }

  return true
}
