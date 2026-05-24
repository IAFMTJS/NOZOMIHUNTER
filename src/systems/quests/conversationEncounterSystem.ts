import type { QuestContract } from "@/contracts/quest-contract"
import type {
  ConversationEncounterContract,
  ConversationMessageContract,
} from "@/contracts/encounter-contract"
import type { AIMemoryContract, AIResponseContract } from "@/contracts/ai-contract"
import {
  CONVERSATION_SCENARIOS,
  getConversationScenario,
} from "@/config/conversationContentConfig"
import { CONVERSATION_ENCOUNTER_CONFIG } from "@/config/conversationEncounterConfig"
import { processDialogue } from "@/systems/ai/dialogueOrchestrator"
import { detectIntent } from "@/systems/ai/intentSystem"
import { scoreConversationExchange } from "@/systems/ai/conversationScoring"
import { updateMemory } from "@/systems/ai/memorySystem"
import { advanceObjective } from "./questValidator"
import { eventBus } from "@/systems/events/eventBus"
import { GAME_EVENTS } from "@/systems/events/eventTypes"
import {
  formatLearnerContent,
  resolveMessageReading,
} from "@/services/jmdict/readingAnnotation"
import {
  applyExchangeToEncounterTrust,
  mergePersistedTrust,
  toNpcRelationshipRow,
} from "@/systems/contracts/relationshipSystem"
import { upsertNpcRelationship, loadNpcRelationship } from "@/services/supabase/relationshipRepository"

function createMessage(
  role: ConversationMessageContract["role"],
  content: string,
  reading?: string
): ConversationMessageContract {
  const resolvedReading = resolveMessageReading(content, reading)
  return {
    id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    content: formatLearnerContent(content, resolvedReading),
    reading: resolvedReading,
    timestamp: new Date().toISOString(),
  }
}

export function createConversationEncounter(
  scenarioId?: string,
  requiredExchanges?: number
): ConversationEncounterContract {
  const scenario =
    CONVERSATION_SCENARIOS.find((s) => s.id === scenarioId) ??
    CONVERSATION_SCENARIOS[
      Math.floor(Math.random() * CONVERSATION_SCENARIOS.length)
    ]

  return {
    scenarioId: scenario.id,
    directorName: scenario.directorName,
    briefing: scenario.briefing,
    requiredExchanges: requiredExchanges ?? scenario.requiredExchanges,
    messages: [
      createMessage("director", scenario.openingLine, scenario.openingLineReading),
    ],
    successfulExchanges: 0,
    wrongTurns: 0,
  }
}

export interface ConversationSubmitResult {
  quest: QuestContract
  aiResponse: AIResponseContract
  memory: AIMemoryContract
  passed: boolean
  encounterFailed: boolean
  encounterComplete: boolean
  feedback: string
}

export async function submitConversationMessage(
  quest: QuestContract,
  playerMessage: string,
  playerId: string,
  memory: AIMemoryContract
): Promise<ConversationSubmitResult> {
  let encounter = quest.conversationEncounter
  if (!encounter) {
    throw new Error("Quest has no conversation encounter")
  }

  if (
    quest.gameMode === "DEEP_COVER" ||
    encounter.relationshipTrust != null
  ) {
    const npcKey = encounter.scenarioId
    try {
      const persisted = await loadNpcRelationship(playerId, npcKey)
      encounter = mergePersistedTrust(encounter, persisted)
    } catch {
      /* offline / unconfigured — use encounter trust only */
    }
  }

  const intent = detectIntent(playerMessage)
  const score = scoreConversationExchange(
    playerMessage,
    intent,
    encounter.scenarioId
  )

  const aiResponse = await processDialogue({
    message: playerMessage,
    playerId,
    memory,
    scenarioId: encounter.scenarioId,
    recentMessages: encounter.messages,
    responseStyle: score.style,
    exchangePassed: score.passed,
  })

  const playerMsg = createMessage("player", playerMessage)
  const directorMsg = createMessage("director", aiResponse.response)

  let successfulExchanges = encounter.successfulExchanges
  let wrongTurns = encounter.wrongTurns

  if (score.passed) {
    successfulExchanges += 1
    eventBus.emit(GAME_EVENTS.ENCOUNTER_ANSWER_CORRECT, {
      questId: quest.id,
      scenarioId: encounter.scenarioId,
    })
  } else {
    wrongTurns += 1
    eventBus.emit(GAME_EVENTS.ENCOUNTER_ANSWER_WRONG, {
      questId: quest.id,
      scenarioId: encounter.scenarioId,
    })
  }

  const updatedMessages = [
    ...encounter.messages,
    playerMsg,
    directorMsg,
  ]

  let updatedEncounter: ConversationEncounterContract = {
    ...encounter,
    messages: updatedMessages,
    successfulExchanges,
    wrongTurns,
  }

  if (quest.gameMode === "DEEP_COVER" || encounter.relationshipTrust != null) {
    updatedEncounter = applyExchangeToEncounterTrust(updatedEncounter, score.passed)
    if (score.trustDelta != null && updatedEncounter.relationshipTrust != null) {
      updatedEncounter = {
        ...updatedEncounter,
        relationshipTrust: Math.min(
          100,
          Math.max(0, updatedEncounter.relationshipTrust + score.trustDelta * 100)
        ),
      }
    }
    try {
      await upsertNpcRelationship({
        ...toNpcRelationshipRow(playerId, encounter.scenarioId, updatedEncounter),
        updatedAt: new Date().toISOString(),
      })
    } catch {
      /* persistence optional when Supabase unavailable */
    }
  }

  const updatedMemory = updateMemory(
    memory,
    score.japaneseTokens,
    score.passed ? [] : [playerMessage.slice(0, 40)]
  )

  const encounterFailed =
    wrongTurns >= CONVERSATION_ENCOUNTER_CONFIG.MAX_WRONG_TURNS

  let objectives = quest.objectives
  if (score.passed) {
    objectives = advanceObjective(quest.objectives, "obj-1", 1)
  }

  const encounterComplete =
    successfulExchanges >= encounter.requiredExchanges

  return {
    quest: {
      ...quest,
      conversationEncounter: updatedEncounter,
      objectives,
    },
    aiResponse,
    memory: updatedMemory,
    passed: score.passed,
    encounterFailed,
    encounterComplete,
    feedback: score.feedback,
  }
}

export function getConversationScenarioTitle(quest: QuestContract): string {
  const id = quest.conversationEncounter?.scenarioId
  if (!id) return quest.title
  return getConversationScenario(id).title
}
