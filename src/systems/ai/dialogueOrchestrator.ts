import { eventBus } from "@/systems/events/eventBus"
import { GAME_EVENTS } from "@/systems/events/eventTypes"
import type { AIResponseContract, AIMemoryContract } from "@/contracts/ai-contract"
import type { ConversationMessageContract } from "@/contracts/encounter-contract"
import { detectIntent } from "./intentSystem"
import { detectEmotion } from "./emotionSystem"
import { createEmptyMemory } from "./memorySystem"
import { FEATURE_FLAGS } from "@/config/features"
import { getConversationScenario } from "@/config/conversationContentConfig"
import {
  formatLearnerContent,
  pairJapanese,
} from "@/services/jmdict/readingAnnotation"

export interface DialogueInput {
  message: string
  playerId: string
  memory?: AIMemoryContract
  scenarioId?: string
  recentMessages?: ConversationMessageContract[]
}

export async function processDialogue(
  input: DialogueInput
): Promise<AIResponseContract> {
  if (!FEATURE_FLAGS.AI_CONVERSATION) {
    return {
      response: "AI systems are offline.",
      emotion: "CALM",
      intent: "RESPONSE",
      confidence: 0,
    }
  }

  const memory = input.memory ?? createEmptyMemory()
  const intent = detectIntent(input.message)
  const emotion = detectEmotion(input.message)

  const response = buildImmersiveResponse(
    intent,
    emotion,
    input.scenarioId,
    memory,
    input.recentMessages
  )

  const result: AIResponseContract = {
    response: formatLearnerContent(response),
    emotion,
    intent,
    confidence: 0.85,
  }

  eventBus.emit(GAME_EVENTS.MESSAGE_RECEIVED, {
    playerId: input.playerId,
    intent,
    emotion,
  })

  eventBus.emit(GAME_EVENTS.AI_RESPONSE_GENERATED, {
    playerId: input.playerId,
    intent,
    emotion,
  })

  return result
}

function buildImmersiveResponse(
  intent: AIResponseContract["intent"],
  emotion: AIResponseContract["emotion"],
  scenarioId?: string,
  memory?: AIMemoryContract,
  recentMessages?: ConversationMessageContract[]
): string {
  const scenario = scenarioId ? getConversationScenario(scenarioId) : null
  const director = scenario?.directorName ?? "Director"
  const tone =
    emotion === "NERVOUS"
      ? "Take your time. "
      : emotion === "FRUSTRATED"
        ? "Breathe. "
        : emotion === "CONFUSED"
          ? "Focus. "
          : ""

  const memoryNote =
    memory && memory.rememberedWords.length > 0 && FEATURE_FLAGS.ADVANCED_AI_MEMORY
      ? ` I recall: ${memory.rememberedWords.slice(-3).join(", ")}.`
      : ""

  const exchangeCount = recentMessages?.filter((m) => m.role === "player").length ?? 0

  if (scenario) {
    const opening = formatLearnerContent(
      scenario.openingLine,
      scenario.openingLineReading
    )

    switch (intent) {
      case "GREETING":
        return `${tone}${director}: ${pairJapanese("ようこそ", "youkoso")}, Hunter. ${opening}${memoryNote}`
      case "QUESTION":
        return `${tone}${director}: ${pairJapanese("いい質問だ。", "ii shitsumon da.")} Clarify your objective.${memoryNote}`
      case "CONFUSION":
        return `${tone}${director}: ${pairJapanese("落ち着け。", "ochitsuke.")} Try again—${pairJapanese("日本語でも", "nihongo demo")} English ${pairJapanese("でも", "demo")}.${memoryNote}`
      case "GOODBYE":
        return `${tone}${director}: ${pairJapanese("またな。", "mata na.")} The gate remembers you.${memoryNote}`
      case "REQUEST":
        return `${tone}${director}: Request noted. ${exchangeCount >= 2 ? "You're almost cleared." : "Continue the briefing."}${memoryNote}`
      default:
        return `${tone}${director}: ${pickScenarioFollowUp(scenario.id, exchangeCount)}${memoryNote}`
    }
  }

  switch (intent) {
    case "GREETING":
      return `${tone}The corridor hums. State your purpose, Hunter.`
    case "QUESTION":
      return `${tone}Interesting. Clarify what you seek.`
    case "CONFUSION":
      return `${tone}The signal is unclear. Try again—in Japanese if you can.`
    case "GOODBYE":
      return `${tone}Until the next encounter.`
    default:
      return `${tone}Noted. Continue.`
  }
}

function pickScenarioFollowUp(scenarioId: string, exchangeCount: number): string {
  if (exchangeCount >= 2) {
    return "Signal stable. One more clear exchange."
  }
  switch (scenarioId) {
    case "signal-relay":
      return "Copy. Relay what you parsed from the fragment."
    case "shadow-briefing":
      return "Keep your voice low. What did you observe?"
    default:
      return "Noted. Report status again."
  }
}
