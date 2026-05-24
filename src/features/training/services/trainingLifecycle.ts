import type { TrainingMissionKind } from "@/systems/training/trainingMissionSystem"
import { buildTrainingQuest } from "@/systems/training/trainingMissionSystem"
import { acceptQuest } from "@/systems/quests/questOrchestrator"
import { assignQuest, dedupeActiveQuests, persistQuestState } from "@/features/quests/services/questPersistence"
import { usePlayerStore } from "@/stores/usePlayerStore"

export async function startTrainingMission(
  userId: string,
  kind: TrainingMissionKind
) {
  const store = usePlayerStore.getState()
  const player = store.player
  if (!player) return null

  const generated = buildTrainingQuest(kind, player.level)
  const quest = acceptQuest(generated, userId)
  await assignQuest(userId, quest)
  store.setQuests(dedupeActiveQuests([...store.activeQuests, quest]))
  await persistQuestState()
  return quest
}
