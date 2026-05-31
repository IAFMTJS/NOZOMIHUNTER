import type { GameModeId } from "@/contracts/game-mode-contract"
import { buildTrainingQuest, isTrainingQuest } from "@/systems/training/trainingMissionSystem"
import { acceptQuest } from "@/systems/quests/questOrchestrator"
import {
  assignQuest,
  dedupeActiveQuests,
  persistQuestState,
} from "@/features/quests/services/questPersistence"
import { failUserQuest } from "@/services/supabase/playerRepository"
import { usePlayerStore } from "@/stores/usePlayerStore"

export async function startTrainingMission(
  userId: string,
  mode: GameModeId,
  fallbackLevel?: number
) {
  const store = usePlayerStore.getState()
  const level = store.player?.level ?? fallbackLevel
  if (level == null) return null

  const staleTraining = store.activeQuests.filter(isTrainingQuest)
  if (staleTraining.length > 0) {
    const kept = store.activeQuests.filter((q) => !isTrainingQuest(q))
    store.setQuests(kept)
    await Promise.all(
      staleTraining.map((q) => failUserQuest(userId, q.id).catch(() => undefined))
    )
  }

  const generated = buildTrainingQuest(mode, level)
  const quest = acceptQuest(generated, userId)
  store.setQuests(dedupeActiveQuests([...store.activeQuests, quest]))
  try {
    await assignQuest(userId, quest)
    await persistQuestState()
  } catch {
    // Keep training playable even when remote persistence is transiently unavailable.
  }
  return quest
}
