import { createClient } from "@/lib/supabase/client"

export interface GameplayEventRow {
  id: string
  event_type: string
  payload: Record<string, unknown>
  created_at: string
}

function requireClient() {
  const supabase = createClient()
  if (!supabase) throw new Error("Supabase is not configured")
  return supabase
}

export async function loadGameplayEvents(
  userId: string,
  limit = 30
): Promise<GameplayEventRow[]> {
  const supabase = requireClient()
  const { data, error } = await supabase
    .from("gameplay_events")
    .select("id, event_type, payload, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) throw new Error(error.message)
  return (data ?? []).map((row) => ({
    id: row.id as string,
    event_type: row.event_type as string,
    payload: (row.payload as Record<string, unknown>) ?? {},
    created_at: row.created_at as string,
  }))
}
