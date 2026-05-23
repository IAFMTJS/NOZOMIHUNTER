import { createClient } from "@/lib/supabase/client"
import { updateTrackedQuestRow } from "@/services/supabase/economyRepository"
import { findActiveQuestRowId } from "@/services/supabase/playerRepository"
import { usePlayerStore } from "@/stores/usePlayerStore"
import { eventBus } from "@/systems/events/eventBus"
import { GAME_EVENTS } from "@/systems/events/eventTypes"
import { setTrackedQuest } from "@/systems/quests/missionTrackingSystem"

export async function trackMissionForUser(
  userId: string,
  questId: string
): Promise<void> {
  const store = usePlayerStore.getState()
  const player = store.player
  if (!player) return

  const updated = setTrackedQuest(player, questId)
  store.setPlayer(updated)

  const supabase = createClient()
  if (!supabase) return

  const rowId = await findActiveQuestRowId(userId, questId)
  await updateTrackedQuestRow(userId, rowId)

  eventBus.emit(GAME_EVENTS.QUEST_TRACKED, { playerId: userId, questId })
}
