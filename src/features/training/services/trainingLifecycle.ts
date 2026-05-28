import type { GameModeId } from "@/contracts/game-mode-contract"
import { buildTrainingQuest } from "@/systems/training/trainingMissionSystem"
import { acceptQuest } from "@/systems/quests/questOrchestrator"
import { assignQuest, dedupeActiveQuests, persistQuestState } from "@/features/quests/services/questPersistence"
import { usePlayerStore } from "@/stores/usePlayerStore"

export async function startTrainingMission(
  userId: string,
  mode: GameModeId,
  fallbackLevel?: number
) {
  const store = usePlayerStore.getState()
  const level = store.player?.level ?? fallbackLevel
  if (level == null) return null

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
