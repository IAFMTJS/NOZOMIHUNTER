import { FEATURE_FLAGS } from "@/config/features"
import { processDialogue } from "@/systems/ai/dialogueOrchestrator"
import type { AIResponseContract } from "@/contracts/ai-contract"

/**
 * Free dialogue service — rule-based orchestrator only (no paid LLM APIs).
 * Future option: self-hosted Ollama or similar, still $0 API cost.
 */
export async function generateDialogue(
  message: string,
  playerId: string
): Promise<AIResponseContract> {
  if (!FEATURE_FLAGS.AI_CONVERSATION) {
    throw new Error("AI conversation disabled")
  }

  return processDialogue({ message, playerId })
}
