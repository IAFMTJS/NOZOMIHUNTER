import type { QuestContract } from "@/contracts/quest-contract"

import { JMDICT_CURATED } from "@/data/jmdictCurated"
import { VOCABULARY_ENCOUNTER_CONFIG } from "@/config/vocabularyEncounterConfig"
import { toEncounterWord } from "@/services/jmdict/normalize"

import { createVocabularyEncounter } from "./vocabularyEncounterSystem"

import { createConversationEncounter } from "./conversationEncounterSystem"

import { createSpeechEncounter } from "./speechEncounterSystem"
import { createListeningEncounter } from "@/systems/dungeons/listeningEncounterSystem"
import { LISTENING_QUEST_CONFIG } from "@/config/listeningQuestConfig"

import {
  formatLearnerContent,
  resolveMessageReading,
  stripRomajiPairs,
} from "@/services/jmdict/readingAnnotation"
import { attachVocabularyPreparation } from "@/systems/vocabulary/vocabularyPreparationOrchestrator"



function hasPlayableVocabulary(quest: QuestContract): boolean {

  const words = quest.vocabularyEncounter?.words

  return Boolean(words && words.length > 0)

}

const curatedById = new Map(JMDICT_CURATED.map((e) => [e.id, e]))

function patchVocabularyWords(quest: QuestContract): QuestContract {
  const encounter = quest.vocabularyEncounter
  if (!encounter?.words.length) return quest

  let changed = false
  const words = encounter.words.map((w) => {
    if (w.reading) return w
    changed = true
    const entry = curatedById.get(w.id)
    return entry ? toEncounterWord(entry) : { ...w, reading: w.romaji }
  })

  if (!changed) return quest
  return { ...quest, vocabularyEncounter: { ...encounter, words } }
}

function patchSpeechPhrases(quest: QuestContract): QuestContract {
  const encounter = quest.speechEncounter
  if (!encounter?.phrases.length) return quest

  let changed = false
  const phrases = encounter.phrases.map((p) => {
    if (p.reading) return p
    changed = true
    const entry = curatedById.get(p.id)
    return entry ? toEncounterWord(entry) : { ...p, reading: p.romaji }
  })

  if (!changed) return quest
  return { ...quest, speechEncounter: { ...encounter, phrases } }
}



function hasPlayableConversation(quest: QuestContract): boolean {

  const messages = quest.conversationEncounter?.messages

  return Boolean(messages && messages.length > 0)

}



function hasPlayableSpeech(quest: QuestContract): boolean {

  const phrases = quest.speechEncounter?.phrases

  return Boolean(phrases && phrases.length > 0)

}

function hasPlayableListening(quest: QuestContract): boolean {

  const fragments = quest.listeningEncounter?.fragments

  return Boolean(fragments && fragments.length > 0)

}

function buildListeningPayload(quest: QuestContract): QuestContract {

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



function buildVocabularyPayload(

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



function buildConversationPayload(quest: QuestContract): QuestContract {

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



function buildSpeechPayload(quest: QuestContract): QuestContract {
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

function backfillConversationReadings(quest: QuestContract): QuestContract {
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

export function repairQuestSnapshot(quest: QuestContract): QuestContract {
  let repaired: QuestContract

  if (quest.type === "DUNGEON" && quest.dungeonRun) {
    repaired = quest
  } else if (quest.type === "SPEECH") {
    repaired = hasPlayableSpeech(quest)
      ? patchSpeechPhrases(quest)
      : buildSpeechPayload(quest)
  } else if (quest.type === "CONVERSATION") {
    repaired = hasPlayableConversation(quest)
      ? backfillConversationReadings(quest)
      : buildConversationPayload(quest)
  } else if (quest.type === "LISTENING") {
    repaired = hasPlayableListening(quest)
      ? quest
      : buildListeningPayload(quest)
  } else {
    const wordCount = quest.isTutorial
      ? VOCABULARY_ENCOUNTER_CONFIG.TUTORIAL_WORD_COUNT
      : VOCABULARY_ENCOUNTER_CONFIG.DEFAULT_WORD_COUNT

    repaired =
      quest.type === "VOCABULARY" && hasPlayableVocabulary(quest)
        ? patchVocabularyWords(quest)
        : buildVocabularyPayload(quest, wordCount)
  }

  if (repaired.vocabularyPreparation) {
    return repaired
  }

  return attachVocabularyPreparation(repaired)
}



export function mergeQuestRow(

  snapshot: QuestContract,

  progress: Record<string, unknown> | null

): QuestContract {

  let quest = snapshot



  if (progress?.vocabularyEncounter) {

    quest = {

      ...quest,

      vocabularyEncounter:

        progress.vocabularyEncounter as QuestContract["vocabularyEncounter"],

    }

  }



  if (progress?.conversationEncounter) {

    quest = {

      ...quest,

      conversationEncounter:

        progress.conversationEncounter as QuestContract["conversationEncounter"],

    }

  }



  if (progress?.speechEncounter) {

    quest = {

      ...quest,

      speechEncounter:

        progress.speechEncounter as QuestContract["speechEncounter"],

    }

  }

  if (progress?.listeningEncounter) {
    quest = {
      ...quest,
      listeningEncounter:
        progress.listeningEncounter as QuestContract["listeningEncounter"],
    }
  }

  if (progress?.dungeonRun) {
    quest = {
      ...quest,
      dungeonRun: progress.dungeonRun as QuestContract["dungeonRun"],
    }
  }

  if (Array.isArray(progress?.objectives)) {

    quest = {

      ...quest,

      objectives: progress.objectives as QuestContract["objectives"],

    }

  }



  return repairQuestSnapshot(quest)

}


