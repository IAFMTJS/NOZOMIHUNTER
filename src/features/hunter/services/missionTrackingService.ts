import { persistTrackedMission } from "@/services/supabase/missionTrackingRepository"
import { usePlayerStore } from "@/stores/usePlayerStore"
import { eventBus } from "@/systems/events/eventBus"
import { GAME_EVENTS } from "@/systems/events/eventTypes"
import { setTrackedQuest } from "@/systems/quests/contractTrackingSystem"

export async function trackMissionForUser(
  userId: string,
  questId: string
): Promise<void> {
  const store = usePlayerStore.getState()
  const player = store.player
  if (!player) return

  const updated = setTrackedQuest(player, questId)
  store.setPlayer(updated)

  try {
    await persistTrackedMission(userId, questId)
  } catch {
    // Offline or Supabase not configured — local track still applies
  }

  eventBus.emit(GAME_EVENTS.QUEST_TRACKED, { playerId: userId, questId })
}
