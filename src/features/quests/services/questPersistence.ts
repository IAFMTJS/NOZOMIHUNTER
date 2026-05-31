import {
  loadPlayer,
  savePlayer,
  assignQuest,
  updateUserQuest,
} from "@/services/supabase/playerRepository"
import { triggerSave, registerSaveHandler } from "@/systems/save/saveSystem"
import { usePlayerStore } from "@/stores/usePlayerStore"
import { dedupeActiveQuests } from "@/systems/quests/questListUtils"
import { repairQuestSnapshot } from "@/systems/quests/questEncounterRepair"
import { attachVocabularyPreparation } from "@/systems/vocabulary/vocabularyPreparationOrchestrator"
import { ensureVocabularyEngine } from "@/services/vocabulary/vocabularyBootstrap"
import { ensureProgressionUnlocksForLevel } from "@/systems/progression/unlockSystem"

let saveRegistered = false

export function ensureQuestSaveHandler(): void {
  if (saveRegistered) return
  registerSaveHandler(async (payload) => {
    await savePlayer(payload.player, payload.activeQuests)
  })
  saveRegistered = true
}

export async function persistQuestState(): Promise<void> {
  const { player, activeQuests } = usePlayerStore.getState()
  if (!player) return
  await triggerSave({ player, activeQuests })
}

export async function hydratePlayerFromDb(userId: string) {
  ensureQuestSaveHandler()
  try {
    await ensureVocabularyEngine(userId)
    const data = await loadPlayer(userId)
    if (!data) {
      usePlayerStore.getState().markHydrationTerminal()
      throw new Error("Hunter profile not found. Check your connection and retry.")
    }

    const repairedQuests = data.activeQuests.map((q) => {
    const repaired = repairQuestSnapshot(q)
    const dismissed = repaired.vocabularyPreparation?.briefingDismissed ?? false
    const withPrep = attachVocabularyPreparation(repaired, {
      playerId: userId,
      player: data.player,
    })
    if (!withPrep.vocabularyPreparation) return withPrep
    return {
      ...withPrep,
      vocabularyPreparation: {
        ...withPrep.vocabularyPreparation,
        briefingDismissed: dismissed,
      },
    }
  })

  const player = {
    ...data.player,
    progression: ensureProgressionUnlocksForLevel(
      data.player.progression,
      data.player.level
    ),
  }

  usePlayerStore.getState().hydrate(player, repairedQuests)

  const needsRepairSave = repairedQuests.some((q, i) => {
    const prev = data.activeQuests[i]
    return (
      (q.vocabularyEncounter?.words.length ?? 0) >
        (prev.vocabularyEncounter?.words.length ?? 0) ||
      (q.conversationEncounter?.messages.length ?? 0) >
        (prev.conversationEncounter?.messages.length ?? 0) ||
      (q.speechEncounter?.phrases.length ?? 0) >
        (prev.speechEncounter?.phrases.length ?? 0)
    )
  })

  if (needsRepairSave || data.identityBackfill) {
    await persistQuestState()
  }

  return usePlayerStore.getState().player
    ? {
        player: usePlayerStore.getState().player!,
        activeQuests: usePlayerStore.getState().activeQuests,
      }
    : data
  } catch (error) {
    usePlayerStore.getState().markHydrationTerminal()
    throw error
  }
}

export async function persistQuestUpdate(
  userId: string,
  quest: import("@/contracts/quest-contract").QuestContract
): Promise<void> {
  usePlayerStore.getState().updateQuest(quest)
  await updateUserQuest(userId, quest)
  await persistQuestState()
}

export { assignQuest, dedupeActiveQuests }
