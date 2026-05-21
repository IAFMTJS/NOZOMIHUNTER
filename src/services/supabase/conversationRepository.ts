import { createClient } from "@/lib/supabase/client"
import type { AIMemoryContract } from "@/contracts/ai-contract"
import type { ConversationMessageContract } from "@/contracts/encounter-contract"
import { createEmptyMemory } from "@/systems/ai/memorySystem"

function requireClient() {
  const supabase = createClient()
  if (!supabase) {
    throw new Error("Supabase is not configured")
  }
  return supabase
}

export interface PlayerAiState {
  conversationId: string | null
  memory: AIMemoryContract
  messages: ConversationMessageContract[]
}

export async function loadPlayerAiState(userId: string): Promise<PlayerAiState> {
  const supabase = requireClient()
  const { data } = await supabase
    .from("conversations")
    .select("id, messages, memory")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!data) {
    return {
      conversationId: null,
      memory: createEmptyMemory(),
      messages: [],
    }
  }

  return {
    conversationId: data.id,
    memory: (data.memory as AIMemoryContract) ?? createEmptyMemory(),
    messages: (data.messages as ConversationMessageContract[]) ?? [],
  }
}

export async function savePlayerAiState(
  userId: string,
  memory: AIMemoryContract,
  messages: ConversationMessageContract[],
  conversationId: string | null
): Promise<string> {
  const supabase = requireClient()
  const payload = {
    messages,
    memory,
    updated_at: new Date().toISOString(),
  }

  if (conversationId) {
    await supabase
      .from("conversations")
      .update(payload)
      .eq("id", conversationId)
    return conversationId
  }

  const { data, error } = await supabase
    .from("conversations")
    .insert({ user_id: userId, ...payload })
    .select("id")
    .single()

  if (error || !data) {
    throw new Error(error?.message ?? "Failed to save conversation")
  }

  return data.id
}
