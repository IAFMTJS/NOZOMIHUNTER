import {
  assignQuest,
  updateUserQuest,
  failUserQuest,
} from "@/services/supabase/playerRepository"
import { savePlayer } from "@/services/supabase/playerRepository"
import { triggerSave, registerSaveHandler } from "@/systems/save/saveSystem"
import { usePlayerStore } from "@/stores/usePlayerStore"
import { dedupeActiveQuests } from "@/systems/quests/questListUtils"
import {
  failDungeonRun,
  registerEncounterFailure,
  shouldFailDungeon,
} from "@/systems/dungeons/dungeonOrchestrator"
import { clearEncounterPayloads } from "@/systems/dungeons/dungeonEncounterFactory"
import { transition } from "@/systems/dungeons/dungeonStateMachine"
import { eventBus } from "@/systems/events/eventBus"
import { GAME_EVENTS } from "@/systems/events/eventTypes"
import {
  advanceBossPhase,
  completeDungeonSector,
} from "@/systems/dungeons/dungeonOrchestrator"
import { hasReviveToken } from "@/systems/economy/boostSystem"
import { isDungeonTimedOut } from "@/systems/economy/shopEffectSystem"
import { consumeShopBoost } from "@/features/inventory/services/shopEffectActions"
import {
  appendStabilizedWordIds,
  extractEncounterWordIds,
} from "@/systems/dungeons/dungeonLexiconRecapSystem"
import { nextPeakEncounterStreak } from "@/systems/learning/encounterPressureSystem"
import type { QuestContract } from "@/contracts/quest-contract"
import { stopRunAudio } from "@/systems/audio/audioSystem"

let saveRegistered = false

export function ensureDungeonSaveHandler(): void {
  if (saveRegistered) return
  registerSaveHandler(async (payload) => {
    await savePlayer(payload.player, payload.activeQuests)
  })
  saveRegistered = true
}

export async function persistDungeonState(): Promise<void> {
  const { player, activeQuests } = usePlayerStore.getState()
  if (!player) return
  await triggerSave({ player, activeQuests })
}

export function getDungeonQuest() {
  const store = usePlayerStore.getState()
  const quest = store.activeQuests.find((q) => q.type === "DUNGEON" && q.dungeonRun)
  return { store, quest, player: store.player }
}

export async function persistDungeonQuest(
  userId: string,
  quest: QuestContract
): Promise<void> {
  const store = usePlayerStore.getState()
  store.updateQuest(quest)
  await updateUserQuest(userId, quest)
  await persistDungeonState()
}

export async function assertDungeonTimedOut(
  userId: string
): Promise<boolean> {
  const { quest } = getDungeonQuest()
  if (!quest?.dungeonRun) return false
  if (isDungeonTimedOut(quest.dungeonRun)) {
    await handleDungeonFailure(userId, quest)
    return true
  }
  return false
}

export async function handleDungeonFailure(
  userId: string,
  quest: QuestContract
): Promise<void> {
  const { store, player } = getDungeonQuest()
  if (!player) return

  const run = quest.dungeonRun
  if (run && isDungeonTimedOut(run)) {
    const failResult = failDungeonRun(quest, player.penalties, userId)
    store.applyPenalties(failResult.penalties)
    const remaining = store.activeQuests.filter((q) => q.id !== quest.id)
    store.setQuests(remaining)
    if (typeof window !== "undefined") stopRunAudio()
    await failUserQuest(userId, quest.id)
    await persistDungeonState()
    return
  }

  const withFailure = registerEncounterFailure(quest, player.penalties)
  if (shouldFailDungeon(withFailure, player.penalties)) {
    if (hasReviveToken(player)) {
      await consumeShopBoost(userId, "REVIVE_TOKEN")
      const revivedRun = withFailure.dungeonRun!
      const retry = {
        ...withFailure,
        ...clearEncounterPayloads(),
        dungeonRun: {
          ...revivedRun,
          encounterFailures: Math.max(0, revivedRun.encounterFailures - 1),
          machineState: transition(revivedRun.machineState, "EXPLORATION"),
          activeType: null,
        },
      }
      await persistDungeonQuest(userId, retry)
      return
    }

    const failResult = failDungeonRun(withFailure, player.penalties, userId)
    store.applyPenalties(failResult.penalties)
    const remaining = store.activeQuests.filter((q) => q.id !== quest.id)
    store.setQuests(remaining)
    if (typeof window !== "undefined") stopRunAudio()
    await failUserQuest(userId, quest.id)
    await persistDungeonState()
    return
  }

  const failedRun = withFailure.dungeonRun!
  const retry = {
    ...withFailure,
    ...clearEncounterPayloads(),
    dungeonRun: {
      ...failedRun,
      machineState: transition(failedRun.machineState, "EXPLORATION"),
      activeType: null,
    },
  }
  await persistDungeonQuest(userId, retry)
}

export async function onSectorCleared(
  userId: string,
  quest: QuestContract
): Promise<
  | { quest: QuestContract; phase: "extraction" }
  | { quest: QuestContract; phase: "boss_continue" }
  | { quest: QuestContract; phase: "reward" }
> {
  const run = quest.dungeonRun!
  const wordIds = extractEncounterWordIds(quest)
  const peakStreak = nextPeakEncounterStreak(run.peakEncounterStreak, quest)
  let questWithRecap = quest
  if (wordIds.length > 0 || peakStreak > (run.peakEncounterStreak ?? 0)) {
    questWithRecap = {
      ...quest,
      dungeonRun: {
        ...run,
        stabilizedWordIds: appendStabilizedWordIds(run, wordIds).stabilizedWordIds,
        peakEncounterStreak: peakStreak,
      },
    }
  }

  eventBus.emit(GAME_EVENTS.ENCOUNTER_COMPLETED, {
    playerId: userId,
    dungeonId: run.dungeon.id,
    encounterType: run.activeType,
  })
  eventBus.emit(GAME_EVENTS.SECTOR_CLEARED, {
    playerId: userId,
    dungeonId: run.dungeon.id,
    encounterType: run.activeType,
  })

  if (run.activeType === "BOSS") {
    const updated = advanceBossPhase(questWithRecap)
    if (updated.dungeonRun?.machineState === "EXTRACTION") {
      await persistDungeonQuest(userId, updated)
      return { quest: updated, phase: "extraction" }
    }
    await persistDungeonQuest(userId, updated)
    return { quest: updated, phase: "boss_continue" }
  }

  const updated = completeDungeonSector(questWithRecap)
  await persistDungeonQuest(userId, updated)
  return { quest: updated, phase: "reward" }
}

export { assignQuest, dedupeActiveQuests }
