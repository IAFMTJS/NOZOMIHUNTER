import { FEATURE_FLAGS } from "@/config/features"
import { processDialogue } from "@/systems/ai/dialogueOrchestrator"
import type { AIResponseContract } from "@/contracts/ai-contract"

/**
 * OpenAI integration point. MVP uses local orchestrator;
 * set OPENAI_API_KEY and extend this service for production LLM calls.
 */
export async function generateDialogue(
  message: string,
  playerId: string
): Promise<AIResponseContract> {
  if (!FEATURE_FLAGS.AI_CONVERSATION) {
    throw new Error("AI conversation disabled")
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    return processDialogue({ message, playerId })
  }

  // Future: fetch OpenAI chat completion with RPG system prompt
  return processDialogue({ message, playerId })
}
