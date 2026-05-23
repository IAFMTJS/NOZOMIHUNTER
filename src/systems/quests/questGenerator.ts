import type { QuestContract } from "@/contracts/quest-contract"

import { createVocabularyEncounter } from "./vocabularyEncounterSystem"

import { createConversationEncounter } from "./conversationEncounterSystem"

import { createSpeechEncounter } from "./speechEncounterSystem"

import { VOCABULARY_ENCOUNTER_CONFIG } from "@/config/vocabularyEncounterConfig"

import { PENALTY_CONFIG } from "@/config/penaltyConfig"

import { createQuestInstanceId } from "./questIds"
import { attachVocabularyPreparation } from "@/systems/vocabulary/vocabularyPreparationOrchestrator"

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
import {
  LISTENING_QUEST_CONFIG,
  LISTENING_QUEST_VARIANTS,
} from "@/config/listeningQuestConfig"
import { createListeningEncounter } from "@/systems/dungeons/listeningEncounterSystem"
import {
  buildQuestRewards,
  hiddenScoutObjective,
} from "@/systems/quests/questRewardFactory"
import { withNarrativeTier } from "@/systems/quests/missionCatalogSystem"

function finalizeQuest(quest: QuestContract): QuestContract {
  return attachVocabularyPreparation(quest)
}

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
      ...buildQuestRewards(playerLevel, "MAIN"),
      unlocks: ["system:conversation"],
    },
    narrativeTier: "MAIN",

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

      rewards: buildQuestRewards(playerLevel, "SIDE"),
      penalties: PENALTY_CONFIG.DEFAULT_QUEST_FAILURE,
      narrativeTier: "SIDE",
    },

    VOCABULARY_ENCOUNTER_CONFIG.DEFAULT_WORD_COUNT

  )



  return finalizeQuest({

    ...template,

    id: createQuestInstanceId(),

    requirements: [{ minimumLevel: Math.max(1, playerLevel - 2) }],

  })

}



export function generateConversationQuest(playerLevel: number): QuestContract {

  const scenario =

    CONVERSATION_SCENARIOS[

      Math.floor(Math.random() * CONVERSATION_SCENARIOS.length)

    ]

  return finalizeQuest(buildConversationQuest(scenario.id, playerLevel))

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
      ...buildQuestRewards(playerLevel, "MAIN"),
      unlocks: ["system:speech"],
    },
    narrativeTier: "MAIN",

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
      hiddenScoutObjective(),
    ],

    requirements: [{ minimumLevel: Math.max(3, playerLevel - 2) }],

  }

}



export function generateSpeechQuest(playerLevel: number): QuestContract {

  const scenario =

    SPEECH_SCENARIOS[Math.floor(Math.random() * SPEECH_SCENARIOS.length)]

  return finalizeQuest(buildSpeechQuest(scenario.id, playerLevel))

}



function buildListeningQuest(playerLevel: number): QuestContract {

  const variant =

    LISTENING_QUEST_VARIANTS[

      Math.floor(Math.random() * LISTENING_QUEST_VARIANTS.length)

    ]

  const fragmentCount = LISTENING_QUEST_CONFIG.DEFAULT_FRAGMENT_COUNT

  const encounter = createListeningEncounter(fragmentCount, variant.briefing)



  return {

    id: createQuestInstanceId(),

    type: "LISTENING",

    title: variant.title,

    description: variant.briefing,

    difficulty: playerLevel < 5 ? "EASY" : playerLevel < 15 ? "NORMAL" : "HARD",

    rewards: {
      ...buildQuestRewards(playerLevel, "MAIN"),
      unlocks: ["system:listening"],
    },
    narrativeTier: "MAIN",

    penalties: PENALTY_CONFIG.DEFAULT_QUEST_FAILURE,

    listeningEncounter: encounter,

    objectives: [
      {
        id: "obj-1",
        description: "Decode audio transmissions",
        currentProgress: 0,
        requiredProgress: fragmentCount,
        completed: false,
      },
      hiddenScoutObjective(),
    ],

    requirements: [{ minimumLevel: Math.max(2, playerLevel - 2) }],

  }

}



export function generateListeningQuest(playerLevel: number): QuestContract {

  return finalizeQuest(buildListeningQuest(playerLevel))

}



/** Random vocabulary, conversation, speech, or listening contract. */

export function generateQuestForPlayer(
  playerLevel: number,
  unlockedSystems: string[] = []
): QuestContract {

  const roll = Math.random()

  const canListening =
    playerLevel >= 2 &&
    unlockedSystems.includes("system:listening")



  if (playerLevel >= 3 && roll < 0.2) {
    return withNarrativeTier(generateSpeechQuest(playerLevel))
  }

  if (canListening && roll < 0.4) {
    return withNarrativeTier(generateListeningQuest(playerLevel))
  }

  if (roll < 0.65) {
    return withNarrativeTier(generateConversationQuest(playerLevel))
  }

  return withNarrativeTier(generateVocabularyQuest(playerLevel))

}



export function generateTutorialQuest(playerId: string): QuestContract {

  const wordCount = VOCABULARY_ENCOUNTER_CONFIG.TUTORIAL_WORD_COUNT

  const encounter = createVocabularyEncounter(wordCount)

  const variant = VOCABULARY_QUEST_VARIANTS[0]



  return finalizeQuest({

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

  })

}



export function getQuestBriefing(quest: QuestContract): string | null {

  if (quest.conversationEncounter?.briefing) {

    return quest.conversationEncounter.briefing

  }

  if (quest.speechEncounter?.briefing) {

    return quest.speechEncounter.briefing

  }

  if (quest.listeningEncounter?.briefing) {

    return quest.listeningEncounter.briefing

  }

  if (quest.type !== "VOCABULARY" || !quest.vocabularyEncounter?.words.length) {

    return null

  }

  const variant = VOCABULARY_QUEST_VARIANTS.find((v) => v.title === quest.title)

  return variant?.briefing ?? VOCABULARY_QUEST_VARIANTS[0].briefing

}


