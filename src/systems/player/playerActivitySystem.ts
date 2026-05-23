import type { PlayerContract } from "@/contracts/player-contract"
import { diffNewUnlocks } from "@/systems/progression/resolveQuestCompletion"
import {
  applySynchronizationActivity,
  computeSynchronizationStatus,
  mergeSyncMilestonesIntoPlayer,
} from "@/systems/synchronization/synchronizationSystem"

export function applyPlayerActivityRecord(player: PlayerContract): {
  player: PlayerContract
  syncUnlocks: string[]
} {
  const beforeProg = player.progression

  const { lastActiveDate, chainDays } = applySynchronizationActivity(
    player.synchronization.lastActiveDate,
    player.synchronization.chainDays
  )

  const status = computeSynchronizationStatus(lastActiveDate, chainDays)

  let updated: PlayerContract = {
    ...player,
    synchronization: {
      chainDays,
      lastActiveDate,
      status: status.status,
      atRisk: status.atRisk,
    },
    updatedAt: new Date().toISOString(),
  }

  updated = mergeSyncMilestonesIntoPlayer(updated, chainDays)

  const syncUnlocks = diffNewUnlocks(beforeProg, updated.progression).filter((k) =>
    k.startsWith("title:discipline")
  )

  return { player: updated, syncUnlocks }
}
