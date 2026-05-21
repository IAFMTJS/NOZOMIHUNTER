import {
  loadPlayer,
  savePlayer,
  assignQuest,
  completeUserQuest,
} from "@/services/supabase/playerRepository"
import { generateQuestForPlayer } from "@/systems/quests/questGenerator"
import {
  acceptQuest,
  completeQuest,
  progressQuestObjective,
} from "@/systems/quests/questOrchestrator"
import { triggerSave, registerSaveHandler } from "@/systems/save/saveSystem"
import { usePlayerStore } from "@/stores/usePlayerStore"
let saveRegistered = false

function ensureSaveHandler() {
  if (saveRegistered) return
  registerSaveHandler(async (payload) => {
    await savePlayer(payload.player, payload.activeQuests)
  })
  saveRegistered = true
}

export async function hydratePlayerFromDb(userId: string) {
  ensureSaveHandler()
  const data = await loadPlayer(userId)
  if (!data) return null
  usePlayerStore.getState().hydrate(data.player, data.activeQuests)
  return data
}

export async function requestNewQuest(userId: string) {
  const store = usePlayerStore.getState()
  const player = store.player
  if (!player) return null

  const quest = generateQuestForPlayer(player.level)
  acceptQuest(quest, userId)
  await assignQuest(userId, quest)

  const quests = [...store.activeQuests, quest]
  store.setQuests(quests)

  const updatedPlayer = { ...player, updatedAt: new Date().toISOString() }
  await triggerSave({ player: updatedPlayer, activeQuests: quests })

  return quest
}

export async function advanceQuest(
  userId: string,
  questId: string,
  objectiveId: string
) {
  const store = usePlayerStore.getState()
  const quest = store.activeQuests.find((q) => q.id === questId)
  if (!quest || !store.player) return null

  const updated = progressQuestObjective(quest, objectiveId)
  const quests = store.activeQuests.map((q) =>
    q.id === questId ? updated : q
  )
  store.setQuests(quests)
  await triggerSave({ player: store.player, activeQuests: quests })
  return updated
}

export async function finishQuest(userId: string, questId: string) {
  const store = usePlayerStore.getState()
  const quest = store.activeQuests.find((q) => q.id === questId)
  const progressionState = store.getProgressionState()
  if (!quest || !progressionState || !store.player) return null

  const result = completeQuest(quest, progressionState, userId)
  if (!result.progression) return null

  store.applyProgressionUpdate({
    xp: result.progression.xp,
    level: result.progression.level,
    rank: result.progression.rank,
    progression: result.progression.progression,
    leveledUp: result.progression.leveledUp,
  })

  const remaining = store.activeQuests.filter((q) => q.id !== questId)
  store.setQuests(remaining)

  const player = usePlayerStore.getState().player!
  await completeUserQuest(userId, questId)
  await triggerSave({ player, activeQuests: remaining })

  return result
}
