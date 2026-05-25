import {
  failUserQuest,
  loadPlayer,
  updateUserQuest,
} from "@/services/supabase/playerRepository"
import { completeQuestGuarded } from "@/services/supabase/progressionRepository"
import {
  refundStaminaGuarded,
  spendStaminaGuarded,
} from "@/services/supabase/economyRepository"
import { acceptQuest } from "@/systems/quests/questOrchestrator"
import { hasActiveBoost, hasEscapeBeacon, hasReviveToken } from "@/systems/economy/boostSystem"
import {
  applyTimeFreeze,
  initDungeonTimer,
  isDungeonTimedOut,
} from "@/systems/economy/shopEffectSystem"
import { consumeActiveBoost } from "@/features/inventory/services/shopEffectActions"
import { canCompleteQuest } from "@/systems/quests/questValidator"
import { generateDungeonQuest } from "@/systems/dungeons/dungeonQuestGenerator"
import { canStartDungeon } from "@/systems/dungeons/dungeonAccess"
import { getDungeonDefinition } from "@/config/dungeonConfig"
import { canSpendStamina } from "@/systems/economy/staminaSystem"
import {
  applyActivityCompletion,
  emitStandardCompletionEvents,
} from "@/features/rewards/services/completionService"
import { eventBus } from "@/systems/events/eventBus"
import { GAME_EVENTS } from "@/systems/events/eventTypes"
import { playAmbience, playAudioCue, unlockAudio, type AmbienceCue } from "@/systems/audio/audioSystem"
import { playThemedCue } from "@/systems/audio/themedAudioSystem"
import { pulseHaptic } from "@/systems/presentation/hapticsSystem"
import { explorationCorruptionDelta } from "@/systems/dungeons/explorationSystem"
import { mergePenalties } from "@/systems/penalties/penaltySystem"
import { applyEncounterStreakToQuestRewards } from "@/systems/quests/questCompletionRewardSystem"
import type { GameModeId } from "@/contracts/game-mode-contract"
import {
  advanceExplorationBeat,
  continueAfterReward,
  deployDungeon,
  engageSectorEncounter,
  failDungeonRun,
  finalizeDungeonExtraction,
} from "@/systems/dungeons/dungeonOrchestrator"
import { resolveRewardProgression } from "@/systems/progression/resolveQuestCompletion"
import type { ExplorationAction } from "@/contracts/dungeon-contract"
import type { QuestContract } from "@/contracts/quest-contract"
import { triggerSave } from "@/systems/save/saveSystem"
import { usePlayerStore } from "@/stores/usePlayerStore"
import {
  assignQuest,
  dedupeActiveQuests,
  ensureDungeonSaveHandler,
  getDungeonQuest,
  persistDungeonQuest,
  persistDungeonState,
} from "./dungeonPersistence"

export async function enterDungeon(userId: string, dungeonKey: string) {
  ensureDungeonSaveHandler()
  const store = usePlayerStore.getState()
  const player = store.player
  if (!player) return null

  const gate = canStartDungeon(player, store.activeQuests, dungeonKey)
  if (!gate.ok) {
    throw new Error(gate.reason ?? "Cannot enter dungeon")
  }

  const def = getDungeonDefinition(dungeonKey)
  const cost = def?.staminaCost ?? 20
  if (!canSpendStamina(player, cost)) {
    throw new Error("Insufficient stamina")
  }

  let quest = generateDungeonQuest(player.level, dungeonKey)
  if (quest.dungeonRun) {
    quest = {
      ...quest,
      dungeonRun: { ...quest.dungeonRun, staminaSpent: cost },
    }
  }
  acceptQuest(quest, userId)

  try {
    await assignQuest(userId, quest)
    await spendStaminaGuarded(cost, dungeonKey)
  } catch (err) {
    await failUserQuest(userId, quest.id)
    throw err
  }

  const fresh = await loadPlayer(userId)
  if (fresh) {
    store.setPlayer(fresh.player)
  }

  eventBus.emit(GAME_EVENTS.STAMINA_SPENT, { playerId: userId, amount: cost, dungeonKey })
  eventBus.emit(GAME_EVENTS.DUNGEON_ENTERED, { playerId: userId, dungeonKey })

  store.setQuests(dedupeActiveQuests([...store.activeQuests, quest]))
  await persistDungeonState()
  return quest
}

function ambienceForDungeonMode(mode: GameModeId | undefined): AmbienceCue {
  switch (mode) {
    case "VOID_PURSUIT":
      return "pursuit"
    case "CORRUPTION_RUN":
      return "corruption"
    default:
      return "sector"
  }
}

export async function deployDungeonRun(userId: string) {
  const { quest } = getDungeonQuest()
  if (!quest) return null
  let updated = deployDungeon(quest, userId)
  updated = initDungeonTimer(updated)
  if (typeof window !== "undefined") {
    playAmbience(ambienceForDungeonMode(updated.dungeonRun?.dungeonMode))
  }
  await persistDungeonQuest(userId, updated)
  return updated
}

export async function advanceDungeonExploration(
  userId: string,
  action: ExplorationAction
) {
  const { quest, player } = getDungeonQuest()
  if (!quest) return null

  const updated = advanceExplorationBeat(quest, action, userId)

  if (action === "LISTEN" && typeof window !== "undefined") {
    unlockAudio()
    playThemedCue(updated.dungeonRun!.dungeon.theme, "enter")
    playAudioCue("confirm")
    pulseHaptic(20)
  }

  const corruptionTick = explorationCorruptionDelta(action)
  if (corruptionTick > 0 && player) {
    const store = usePlayerStore.getState()
    store.applyPenalties(
      mergePenalties(player.penalties, {
        corruption: corruptionTick,
        fatigue: 0,
        xpDebt: 0,
      })
    )
  }

  await persistDungeonQuest(userId, updated)
  return updated
}

export async function engageDungeonSector(userId: string) {
  const { quest } = getDungeonQuest()
  if (!quest) return null

  const run = quest.dungeonRun!
  let working = quest

  if (run.machineState === "REWARD") {
    working = continueAfterReward(quest)
  }

  const updated = engageSectorEncounter(working)
  eventBus.emit(GAME_EVENTS.ENCOUNTER_STARTED, {
    playerId: userId,
    dungeonId: run.dungeon.id,
    encounterType: updated.dungeonRun?.activeType,
  })
  await persistDungeonQuest(userId, updated)
  return updated
}

export async function continueDungeonAfterReward(userId: string) {
  const { quest } = getDungeonQuest()
  if (!quest) return null

  const updated = continueAfterReward(quest)
  await persistDungeonQuest(userId, updated)
  return updated
}

/** @deprecated Use advanceDungeonExploration + engageDungeonSector */
export async function startDungeonSector(userId: string) {
  return engageDungeonSector(userId)
}

export async function abandonDungeon(userId: string) {
  const { quest, store, player } = getDungeonQuest()
  if (!quest || !player) return null

  const spent = quest.dungeonRun?.staminaSpent ?? 0
  if (spent > 0) {
    try {
      await refundStaminaGuarded(spent)
      eventBus.emit(GAME_EVENTS.STAMINA_REFUNDED, {
        playerId: userId,
        amount: spent,
        dungeonId: quest.dungeonRun?.dungeon.id,
      })
      const fresh = await loadPlayer(userId)
      if (fresh) store.setPlayer(fresh.player)
    } catch {
      /* refund best-effort */
    }
  }

  if (hasEscapeBeacon(player)) {
    await consumeActiveBoost(userId, "ESCAPE_BEACON")
    const remaining = store.activeQuests.filter((q) => q.id !== quest.id)
    store.setQuests(remaining)
    await failUserQuest(userId, quest.id)
    await persistDungeonState()
    return { escaped: true as const, quest }
  }

  const failResult = failDungeonRun(quest, player.penalties, userId)
  store.applyPenalties(failResult.penalties)
  const remaining = store.activeQuests.filter((q) => q.id !== quest.id)
  store.setQuests(remaining)
  await failUserQuest(userId, quest.id)
  await persistDungeonState()
  return failResult
}

export async function freezeDungeonTimer(userId: string) {
  const { quest, player } = getDungeonQuest()
  if (!quest?.dungeonRun || !player) return null
  if (!hasActiveBoost(player, "TIME_FREEZE")) {
    throw new Error("Time freeze not active")
  }

  const run = applyTimeFreeze(quest.dungeonRun)
  const updated = { ...quest, dungeonRun: run }
  await consumeActiveBoost(userId, "TIME_FREEZE")
  await persistDungeonQuest(userId, updated)
  return updated
}


export async function extractDungeonRewards(userId: string) {
  const { quest, store } = getDungeonQuest()
  const progressionState = store.getProgressionState()
  if (!quest?.dungeonRun || !progressionState || !store.player) return null

  const ready = applyEncounterStreakToQuestRewards(finalizeDungeonExtraction(quest))
  if (!canCompleteQuest(ready)) {
    throw new Error("Dungeon objectives not complete")
  }

  await updateUserQuest(userId, ready)

  const server = await completeQuestGuarded(ready.id, 0)

  const { progression, newUnlocks } = resolveRewardProgression(
    progressionState.progression,
    ready.rewards
  )

  const { leveledUp, rankUp } = await applyActivityCompletion({
    userId,
    quest: ready,
    server,
    progression,
    newUnlocks,
    penaltiesBefore: progressionState.penalties,
    rankBefore: progressionState.rank,
  })

  emitStandardCompletionEvents(userId, ready.id, server, leveledUp, rankUp, {
    dungeonId: quest.dungeonRun.dungeon.id,
  })

  const remaining = store.activeQuests.filter((q) => q.id !== quest.id)
  store.setQuests(remaining)

  const player = usePlayerStore.getState().player!
  await triggerSave({ player, activeQuests: remaining })

  return {
    quest: ready,
    progression: {
      xp: server.xp,
      level: server.level,
      rank: server.rank,
      penalties: player.penalties,
      progression: player.progression,
      xpGained: server.xp_gained,
      leveledUp,
      rankUp,
    },
  }
}
