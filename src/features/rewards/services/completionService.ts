import type { QuestContract } from "@/contracts/quest-contract"
import type { PendingRewardBundleContract } from "@/contracts/economy-contract"
import type { HunterRank } from "@/contracts/player-contract"
import type { PlayerProgressionContract } from "@/contracts/player-contract"
import type { PlayerPenaltyContract } from "@/contracts/player-contract"
import { loadPlayer } from "@/services/supabase/playerRepository"
import type { GuardedQuestCompletionResult } from "@/services/supabase/progressionRepository"
import { usePlayerStore } from "@/stores/usePlayerStore"
import { eventBus } from "@/systems/events/eventBus"
import { GAME_EVENTS } from "@/systems/events/eventTypes"
import { parsePendingRewards } from "@/systems/rewards/rewardClaimSystem"
import { applyFatigueRecoveryOnComplete } from "@/systems/penalties/penaltyGameplaySystem"
import { applyPlayerActivityRecord } from "@/systems/player/playerActivitySystem"
import { emitUnlockGrants } from "@/systems/progression/resolveQuestCompletion"
import { markTutorialComplete } from "@/systems/tutorial/tutorialSystem"

export interface ActivityCompletionInput {
  userId: string
  quest: QuestContract
  server: GuardedQuestCompletionResult
  progression: PlayerProgressionContract
  newUnlocks: string[]
  penaltiesBefore: PlayerPenaltyContract
  rankBefore: HunterRank
}

export interface ActivityCompletionResult {
  pending: PendingRewardBundleContract | null
  leveledUp: boolean
  rankUp: boolean
  syncUnlocks: string[]
}

/** Feature-layer orchestration after guarded quest/dungeon completion. */
export async function applyActivityCompletion(
  input: ActivityCompletionInput
): Promise<ActivityCompletionResult> {
  const store = usePlayerStore.getState()
  const player = store.player
  if (!player) {
    return { pending: null, leveledUp: false, rankUp: false, syncUnlocks: [] }
  }

  let progression = input.progression
  if (input.quest.isTutorial) {
    progression = markTutorialComplete(progression)
  }

  const leveledUp = input.server.level > input.server.previous_level
  const rankUp = input.server.rank !== input.rankBefore

  store.applyProgressionUpdate({
    xp: input.server.xp,
    level: input.server.level,
    rank: input.server.rank,
    progression,
    penalties: applyFatigueRecoveryOnComplete({
      ...input.penaltiesBefore,
      xpDebt: Math.max(0, input.penaltiesBefore.xpDebt - input.server.xp_gained),
    }),
    leveledUp,
    rankUp,
    newUnlocks: input.newUnlocks,
  })

  emitUnlockGrants(input.userId, input.newUnlocks)

  const pending = await syncRewardStateFromServer(input.userId, input.server)

  const activity = applyPlayerActivityRecord(usePlayerStore.getState().player!)
  const current = usePlayerStore.getState().player!
  usePlayerStore.getState().setPlayer({
    ...activity.player,
    pendingRewards: pending ?? current.pendingRewards,
    economy: activity.player.economy,
    inventory: activity.player.inventory,
  })

  const syncUnlocks = activity.syncUnlocks
  if (syncUnlocks.length > 0) {
    emitUnlockGrants(input.userId, syncUnlocks)
    usePlayerStore.setState((s) => ({
      unlockNoticeQueue: [...s.unlockNoticeQueue, ...syncUnlocks],
    }))
  }

  return { pending, leveledUp, rankUp, syncUnlocks }
}

export async function syncRewardStateFromServer(
  userId: string,
  server: GuardedQuestCompletionResult
): Promise<PendingRewardBundleContract | null> {
  const fresh = await loadPlayer(userId)
  const store = usePlayerStore.getState()
  const player = store.player
  if (!fresh || !player) return null

  const pending =
    parsePendingRewards(server.pending_rewards) ?? fresh.player.pendingRewards

  store.setPlayer({
    ...player,
    economy: fresh.player.economy,
    inventory: fresh.player.inventory,
    pendingRewards: pending,
  })

  if (pending && !pending.claimed) {
    eventBus.emit(GAME_EVENTS.REWARDS_PENDING, {
      playerId: userId,
      pending,
      xpGained: pending.xpGained,
    })
    for (const item of pending.items) {
      eventBus.emit(GAME_EVENTS.ITEM_GRANTED, {
        playerId: userId,
        itemKey: item.itemKey,
        quantity: item.quantity,
      })
    }
  }

  return pending
}

export function emitStandardCompletionEvents(
  userId: string,
  questId: string,
  server: GuardedQuestCompletionResult,
  leveledUp: boolean,
  rankUp: boolean,
  extra?: { dungeonId?: string }
): void {
  if (extra?.dungeonId) {
    eventBus.emit(GAME_EVENTS.DUNGEON_COMPLETED, {
      playerId: userId,
      dungeonId: extra.dungeonId,
      xp: server.xp_gained,
    })
  } else {
    eventBus.emit(GAME_EVENTS.QUEST_COMPLETED, { playerId: userId, questId })
  }

  eventBus.emit(GAME_EVENTS.XP_GAINED, {
    playerId: userId,
    xpGained: server.xp_gained,
    totalXp: server.xp,
  })

  if (leveledUp) {
    eventBus.emit(GAME_EVENTS.LEVEL_UP, {
      playerId: userId,
      level: server.level,
      previousLevel: server.previous_level,
    })
  }
  if (rankUp) {
    eventBus.emit(GAME_EVENTS.RANK_UP, { playerId: userId, rank: server.rank })
  }
}
