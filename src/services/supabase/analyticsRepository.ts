import { recordGameplayEvent } from "@/services/supabase/progressionRepository"
import type { GameEventType } from "@/systems/events/eventTypes"

export async function persistGameplayEvent(
  event: GameEventType,
  payload: unknown
): Promise<void> {
  await recordGameplayEvent(event, payload)
}
