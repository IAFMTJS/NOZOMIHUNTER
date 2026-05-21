import { eventBus } from "@/systems/events/eventBus"
import { GAME_EVENTS } from "@/systems/events/eventTypes"
import type { AIResponseContract } from "@/contracts/ai-contract"
import { detectIntent } from "./intentSystem"
import { detectEmotion } from "./emotionSystem"
import { FEATURE_FLAGS } from "@/config/features"

export interface DialogueInput {
  message: string
  playerId: string
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

  const intent = detectIntent(input.message)
  const emotion = detectEmotion(input.message)

  const response = buildImmersiveResponse(intent, emotion)

  const result: AIResponseContract = {
    response,
    emotion,
    intent,
    confidence: 0.85,
  }

  eventBus.emit(GAME_EVENTS.AI_RESPONSE_GENERATED, {
    playerId: input.playerId,
    intent,
    emotion,
  })

  return result
}

function buildImmersiveResponse(
  intent: AIResponseContract["intent"],
  emotion: AIResponseContract["emotion"]
): string {
  const tone =
    emotion === "NERVOUS"
      ? "Take your time. "
      : emotion === "FRUSTRATED"
        ? "Breathe. "
        : ""

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
