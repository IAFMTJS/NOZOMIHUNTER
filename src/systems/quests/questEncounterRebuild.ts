import type { QuestContract } from "@/contracts/quest-contract"
import { getCatalogEntryById } from "@/systems/mastery/vocabularyCatalog"
import { VOCABULARY_ENCOUNTER_CONFIG } from "@/config/vocabularyEncounterConfig"
import { LISTENING_QUEST_CONFIG } from "@/config/listeningQuestConfig"
import { toEncounterWord } from "@/services/jmdict/normalize"
import {
  attachChallengeFields,
  defaultListeningDirection,
  resolveInputMode,
} from "@/systems/learning/challengeDisplaySystem"
import { getMasteryMap } from "@/systems/mastery/masterySystem"
import { resolveQuestGameMode } from "@/systems/gameModes/gameModeSystem"
import { createVocabularyEncounter } from "./vocabularyEncounterSystem"
import { createConversationEncounter } from "./conversationEncounterSystem"
import { createSpeechEncounter } from "./speechEncounterSystem"
import { createListeningEncounter } from "@/systems/dungeons/listeningEncounterSystem"
import { rebuildQuestForGameMode } from "@/systems/gameModes/gameModeEncounterSystem"
import { applyGameModeToQuest } from "@/systems/gameModes/gameModeQuestBuilder"
import {
  formatLearnerContent,
  resolveMessageReading,
  stripRomajiPairs,
} from "@/services/jmdict/readingAnnotation"

export function hasPlayableVocabulary(quest: QuestContract): boolean {
  const words = quest.vocabularyEncounter?.words
  return Boolean(words && words.length > 0)
}

export function hasPlayableConversation(quest: QuestContract): boolean {
  const messages = quest.conversationEncounter?.messages
  return Boolean(messages && messages.length > 0)
}

export function hasPlayableSpeech(quest: QuestContract): boolean {
  const phrases = quest.speechEncounter?.phrases
  return Boolean(phrases && phrases.length > 0)
}

export function hasPlayableListening(quest: QuestContract): boolean {
  const fragments = quest.listeningEncounter?.fragments
  return Boolean(fragments && fragments.length > 0)
}

export function patchVocabularyWords(quest: QuestContract): QuestContract {
  const encounter = quest.vocabularyEncounter
  if (!encounter?.words.length) return quest

  const mode = resolveQuestGameMode(quest)
  const masteryMap = getMasteryMap()
  let changed = false
  const words = encounter.words.map((w) => {
    let word = w
    if (!w.reading) {
      changed = true
      const entry = getCatalogEntryById(w.id)
      word = entry ? toEncounterWord(entry) : { ...w, reading: w.romaji }
    }
    if (!word.promptDirection || !word.inputMode) {
      changed = true
      const mastery = masteryMap.get(word.id) ?? 0
      word = attachChallengeFields(word, mastery, undefined, mode)
    }
    return word
  })

  if (!changed) return quest
  return { ...quest, vocabularyEncounter: { ...encounter, words } }
}

export function patchSpeechPhrases(quest: QuestContract): QuestContract {
  const encounter = quest.speechEncounter
  if (!encounter?.phrases.length) return quest

  const mode = resolveQuestGameMode(quest)
  const masteryMap = getMasteryMap()
  let changed = false
  const phrases = encounter.phrases.map((p) => {
    let phrase = p
    if (!p.reading) {
      changed = true
      const entry = getCatalogEntryById(p.id)
      phrase = entry ? toEncounterWord(entry) : { ...p, reading: p.romaji }
    }
    if (!phrase.promptDirection || !phrase.inputMode) {
      changed = true
      const mastery = masteryMap.get(phrase.id) ?? 0
      phrase = attachChallengeFields(phrase, mastery, undefined, mode)
    }
    return phrase
  })

  if (!changed) return quest
  return { ...quest, speechEncounter: { ...encounter, phrases } }
}

export function patchListeningFragments(quest: QuestContract): QuestContract {
  const encounter = quest.listeningEncounter
  if (!encounter?.fragments.length) return quest

  const direction = defaultListeningDirection()
  const inputMode = resolveInputMode(direction)
  let changed = false
  const fragments = encounter.fragments.map((f) => {
    if (f.promptDirection && f.inputMode) return f
    changed = true
    return {
      ...f,
      promptDirection: f.promptDirection ?? direction,
      inputMode: f.inputMode ?? inputMode,
    }
  })

  if (!changed) return quest
  return { ...quest, listeningEncounter: { ...encounter, fragments } }
}

export function buildListeningPayload(quest: QuestContract): QuestContract {
  const count = LISTENING_QUEST_CONFIG.DEFAULT_FRAGMENT_COUNT
  const briefing =
    quest.listeningEncounter?.briefing ??
    quest.description ??
    "Listen to each signal and transmit what you heard."
  const encounter = createListeningEncounter(count, briefing)
  const cleared = Math.min(
    quest.objectives[0]?.currentProgress ?? 0,
    encounter.fragments.length
  )

  return {
    ...quest,
    type: "LISTENING",
    listeningEncounter: {
      ...encounter,
      currentIndex: Math.min(cleared, encounter.fragments.length),
      wrongAttempts: quest.listeningEncounter?.wrongAttempts ?? 0,
    },
    objectives: [
      {
        id: "obj-1",
        description: "Decode audio transmissions",
        currentProgress: cleared,
        requiredProgress: encounter.fragments.length,
        completed: cleared >= encounter.fragments.length,
      },
    ],
  }
}

export function buildVocabularyPayload(
  quest: QuestContract,
  wordCount: number
): QuestContract {
  const encounter = createVocabularyEncounter(wordCount)
  const cleared = Math.min(
    quest.objectives[0]?.currentProgress ?? 0,
    encounter.words.length
  )

  return {
    ...quest,
    type: "VOCABULARY",
    description:
      quest.description ||
      "Identify each vocabulary target by romaji or English.",
    vocabularyEncounter: {
      ...encounter,
      currentIndex: Math.min(cleared, encounter.words.length - 1),
    },
    objectives: [
      {
        id: "obj-1",
        description: "Identify vocabulary targets",
        currentProgress: cleared,
        requiredProgress: encounter.words.length,
        completed: cleared >= encounter.words.length,
      },
    ],
  }
}

export function buildConversationPayload(quest: QuestContract): QuestContract {
  const scenarioId = quest.conversationEncounter?.scenarioId
  const encounter = createConversationEncounter(scenarioId)
  const cleared = Math.min(
    quest.objectives[0]?.currentProgress ?? 0,
    encounter.requiredExchanges
  )

  return {
    ...quest,
    type: "CONVERSATION",
    conversationEncounter: {
      ...encounter,
      successfulExchanges: cleared,
      messages:
        quest.conversationEncounter?.messages?.length &&
        hasPlayableConversation(quest)
          ? quest.conversationEncounter.messages
          : encounter.messages,
    },
    objectives: [
      {
        id: "obj-1",
        description: "Complete dialogue exchanges",
        currentProgress: cleared,
        requiredProgress: encounter.requiredExchanges,
        completed: cleared >= encounter.requiredExchanges,
      },
    ],
  }
}

export function buildSpeechPayload(quest: QuestContract): QuestContract {
  const scenarioId = quest.speechEncounter?.scenarioId
  const encounter = createSpeechEncounter(scenarioId)
  const cleared = Math.min(
    quest.objectives[0]?.currentProgress ?? 0,
    encounter.phrases.length
  )

  return {
    ...quest,
    type: "SPEECH",
    speechEncounter: {
      ...encounter,
      currentIndex: Math.min(cleared, encounter.phrases.length - 1),
      attempts: quest.speechEncounter?.attempts ?? [],
    },
    objectives: [
      {
        id: "obj-1",
        description: "Transmit spoken phrases",
        currentProgress: cleared,
        requiredProgress: encounter.phrases.length,
        completed: cleared >= encounter.phrases.length,
      },
    ],
  }
}

export function backfillConversationReadings(quest: QuestContract): QuestContract {
  const encounter = quest.conversationEncounter
  if (!encounter?.messages.length) return quest

  const messages = encounter.messages.map((msg) => {
    const bare = stripRomajiPairs(msg.content)
    const reading = resolveMessageReading(bare, msg.reading)
    const content = formatLearnerContent(bare, reading)
    if (content === msg.content && reading === msg.reading) return msg
    return { ...msg, content, reading }
  })

  return {
    ...quest,
    conversationEncounter: { ...encounter, messages },
  }
}

export function rebuildQuestEncounter(quest: QuestContract): QuestContract {
  if (quest.type === "DUNGEON" && quest.dungeonRun) {
    return quest
  }

  const mode = resolveQuestGameMode(quest)
  if (mode !== "STANDARD") {
    const withMode = hasPlayableModePayload(quest, mode)
      ? quest
      : applyGameModeToQuest(quest, mode)
    return rebuildQuestForGameMode(withMode)
  }

  if (quest.type === "SPEECH") {
    return hasPlayableSpeech(quest)
      ? patchSpeechPhrases(quest)
      : buildSpeechPayload(quest)
  }
  if (quest.type === "CONVERSATION") {
    return hasPlayableConversation(quest)
      ? backfillConversationReadings(quest)
      : buildConversationPayload(quest)
  }
  if (quest.type === "LISTENING") {
    return hasPlayableListening(quest)
      ? patchListeningFragments(quest)
      : buildListeningPayload(quest)
  }

  const wordCount = quest.isTutorial
    ? VOCABULARY_ENCOUNTER_CONFIG.TUTORIAL_WORD_COUNT
    : VOCABULARY_ENCOUNTER_CONFIG.DEFAULT_WORD_COUNT

  return quest.type === "VOCABULARY" && hasPlayableVocabulary(quest)
    ? patchVocabularyWords(quest)
    : buildVocabularyPayload(quest, wordCount)
}

function hasPlayableModePayload(
  quest: QuestContract,
  mode: ReturnType<typeof resolveQuestGameMode>
): boolean {
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
      return hasPlayableVocabulary(quest)
    case "SEMANTIC_NETWORK":
      return Boolean(quest.semanticNetworkEncounter)
    case "SIGNAL_CALIBRATION":
    case "LOST_TRANSMISSION":
      return hasPlayableListening(quest)
    case "SHADOW_ECHO":
      return hasPlayableSpeech(quest)
    case "GHOST_INTERROGATION":
    case "DEEP_COVER":
    case "PANIC_CHANNEL":
      return hasPlayableConversation(quest)
    default:
      return false
  }
}
