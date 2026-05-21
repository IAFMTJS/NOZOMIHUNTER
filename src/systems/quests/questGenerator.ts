import type { QuestContract } from "@/contracts/quest-contract"

import { createVocabularyEncounter } from "./vocabularyEncounterSystem"

import { createConversationEncounter } from "./conversationEncounterSystem"

import { createSpeechEncounter } from "./speechEncounterSystem"

import { VOCABULARY_ENCOUNTER_CONFIG } from "@/config/vocabularyEncounterConfig"

import { PENALTY_CONFIG } from "@/config/penaltyConfig"

import { createQuestInstanceId } from "./questIds"

import { VOCABULARY_QUEST_VARIANTS } from "@/config/questContentConfig"

import {

  CONVERSATION_SCENARIOS,

  getConversationScenario,

} from "@/config/conversationContentConfig"

import {
  SPEECH_SCENARIOS,
  SPEECH_QUEST_VARIANTS,
  getSpeechScenario,
} from "@/config/speechContentConfig"



function buildVocabularyQuest(

  base: Omit<QuestContract, "id" | "vocabularyEncounter" | "objectives">,

  wordCount: number

): Omit<QuestContract, "id"> {

  const encounter = createVocabularyEncounter(wordCount)

  return {

    ...base,

    type: "VOCABULARY",

    vocabularyEncounter: encounter,

    objectives: [

      {

        id: "obj-1",

        description: "Identify vocabulary targets",

        currentProgress: 0,

        requiredProgress: encounter.words.length,

        completed: false,

      },

    ],

  }

}



function buildConversationQuest(

  scenarioId: string,

  playerLevel: number

): QuestContract {

  const scenario = getConversationScenario(scenarioId)

  const encounter = createConversationEncounter(scenario.id)



  return {

    id: createQuestInstanceId(),

    type: "CONVERSATION",

    title: scenario.title,

    description: scenario.description,

    difficulty: playerLevel < 5 ? "EASY" : playerLevel < 15 ? "NORMAL" : "HARD",

    rewards: {

      xp: playerLevel < 5 ? 60 : playerLevel < 15 ? 75 : 90,

      unlocks: ["system:conversation"],

    },

    penalties: PENALTY_CONFIG.DEFAULT_QUEST_FAILURE,

    conversationEncounter: encounter,

    objectives: [

      {

        id: "obj-1",

        description: "Complete dialogue exchanges",

        currentProgress: 0,

        requiredProgress: encounter.requiredExchanges,

        completed: false,

      },

    ],

    requirements: [{ minimumLevel: Math.max(1, playerLevel - 2) }],

  }

}



export function generateVocabularyQuest(playerLevel: number): QuestContract {

  const variant =

    VOCABULARY_QUEST_VARIANTS[

      Math.floor(Math.random() * VOCABULARY_QUEST_VARIANTS.length)

    ]



  const template = buildVocabularyQuest(

    {

      type: "VOCABULARY",

      title: variant.title,

      description: variant.description,

      difficulty: playerLevel < 5 ? "EASY" : playerLevel < 15 ? "NORMAL" : "HARD",

      rewards: { xp: playerLevel < 5 ? 50 : playerLevel < 15 ? 65 : 80 },

      penalties: PENALTY_CONFIG.DEFAULT_QUEST_FAILURE,

    },

    VOCABULARY_ENCOUNTER_CONFIG.DEFAULT_WORD_COUNT

  )



  return {

    ...template,

    id: createQuestInstanceId(),

    requirements: [{ minimumLevel: Math.max(1, playerLevel - 2) }],

  }

}



export function generateConversationQuest(playerLevel: number): QuestContract {

  const scenario =

    CONVERSATION_SCENARIOS[

      Math.floor(Math.random() * CONVERSATION_SCENARIOS.length)

    ]

  return buildConversationQuest(scenario.id, playerLevel)

}



function buildSpeechQuest(scenarioId: string, playerLevel: number): QuestContract {

  const scenario = getSpeechScenario(scenarioId)

  const encounter = createSpeechEncounter(scenario.id)

  const variant =

    SPEECH_QUEST_VARIANTS[

      Math.floor(Math.random() * SPEECH_QUEST_VARIANTS.length)

    ]



  return {

    id: createQuestInstanceId(),

    type: "SPEECH",

    title: variant.title,

    description: variant.description,

    difficulty: playerLevel < 5 ? "EASY" : playerLevel < 15 ? "NORMAL" : "HARD",

    rewards: {

      xp: playerLevel < 5 ? 55 : playerLevel < 15 ? 70 : 85,

      unlocks: ["system:speech"],

    },

    penalties: PENALTY_CONFIG.DEFAULT_QUEST_FAILURE,

    speechEncounter: encounter,

    objectives: [

      {

        id: "obj-1",

        description: "Transmit spoken phrases",

        currentProgress: 0,

        requiredProgress: encounter.phrases.length,

        completed: false,

      },

    ],

    requirements: [{ minimumLevel: Math.max(3, playerLevel - 2) }],

  }

}



export function generateSpeechQuest(playerLevel: number): QuestContract {

  const scenario =

    SPEECH_SCENARIOS[Math.floor(Math.random() * SPEECH_SCENARIOS.length)]

  return buildSpeechQuest(scenario.id, playerLevel)

}



/** Random vocabulary, conversation, or speech contract (Phase 4). */

export function generateQuestForPlayer(playerLevel: number): QuestContract {

  const roll = Math.random()

  if (playerLevel >= 3 && roll < 0.34) {

    return generateSpeechQuest(playerLevel)

  }

  if (roll < 0.67) {

    return generateConversationQuest(playerLevel)

  }

  return generateVocabularyQuest(playerLevel)

}



export function generateTutorialQuest(playerId: string): QuestContract {

  const wordCount = VOCABULARY_ENCOUNTER_CONFIG.TUTORIAL_WORD_COUNT

  const encounter = createVocabularyEncounter(wordCount)

  const variant = VOCABULARY_QUEST_VARIANTS[0]



  return {

    id: `tutorial-${playerId}`,

    type: "VOCABULARY",

    title: "First Hunt",

    description: variant.briefing,

    difficulty: "EASY",

    isTutorial: true,

    rewards: { xp: 40, unlocks: ["system:tutorial:intro"] },

    penalties: PENALTY_CONFIG.TUTORIAL_QUEST_FAILURE,

    vocabularyEncounter: encounter,

    objectives: [

      {

        id: "obj-1",

        description: "Identify vocabulary targets",

        currentProgress: 0,

        requiredProgress: encounter.words.length,

        completed: false,

      },

    ],

  }

}



export function getQuestBriefing(quest: QuestContract): string | null {

  if (quest.conversationEncounter?.briefing) {

    return quest.conversationEncounter.briefing

  }

  if (quest.speechEncounter?.briefing) {

    return quest.speechEncounter.briefing

  }

  if (quest.type !== "VOCABULARY" || !quest.vocabularyEncounter?.words.length) {

    return null

  }

  const variant = VOCABULARY_QUEST_VARIANTS.find((v) => v.title === quest.title)

  return variant?.briefing ?? VOCABULARY_QUEST_VARIANTS[0].briefing

}


