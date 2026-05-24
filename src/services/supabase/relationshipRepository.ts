import { createClient } from "@/lib/supabase/client"
import type { NpcRelationshipContract } from "@/systems/contracts/relationshipSystem"

function requireClient() {
  const supabase = createClient()
  if (!supabase) {
    throw new Error("Supabase is not configured")
  }
  return supabase
}

function rowToContract(row: {
  user_id: string
  npc_key: string
  trust: number
  successful_exchanges: number
  failed_exchanges: number
  updated_at: string
}): NpcRelationshipContract {
  return {
    userId: row.user_id,
    npcKey: row.npc_key,
    trust: row.trust,
    successfulExchanges: row.successful_exchanges,
    failedExchanges: row.failed_exchanges,
    updatedAt: row.updated_at,
  }
}

export async function loadNpcRelationship(
  userId: string,
  npcKey: string
): Promise<NpcRelationshipContract | null> {
  const supabase = requireClient()
  const { data, error } = await supabase
    .from("npc_relationships")
    .select(
      "user_id, npc_key, trust, successful_exchanges, failed_exchanges, updated_at"
    )
    .eq("user_id", userId)
    .eq("npc_key", npcKey)
    .maybeSingle()

  if (error || !data) return null
  return rowToContract(data)
}

export async function upsertNpcRelationship(
  row: NpcRelationshipContract
): Promise<void> {
  const supabase = requireClient()
  const { error } = await supabase.from("npc_relationships").upsert(
    {
      user_id: row.userId,
      npc_key: row.npcKey,
      trust: row.trust,
      successful_exchanges: row.successfulExchanges,
      failed_exchanges: row.failedExchanges,
      updated_at: row.updatedAt,
    },
    { onConflict: "user_id,npc_key" }
  )
  if (error) throw error
}
