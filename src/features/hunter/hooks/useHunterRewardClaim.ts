"use client"

import { useCallback, useState } from "react"
import type { PlayerContract } from "@/contracts/player-contract"
import { clearPendingRewardsGuarded } from "@/services/supabase/economyRepository"
import { clearPendingRewards } from "@/systems/rewards/rewardClaimSystem"
import { hydratePlayerFromDb } from "@/features/quests/services/questService"
import { eventBus } from "@/systems/events/eventBus"
import { GAME_EVENTS } from "@/systems/events/eventTypes"

export function useHunterRewardClaim(
  player: PlayerContract | null,
  userId: string | undefined,
  setPlayer: (p: PlayerContract) => void
) {
  const [claimError, setClaimError] = useState<string | null>(null)

  const claimRewards = useCallback(async () => {
    if (!player) return
    setClaimError(null)
    try {
      await clearPendingRewardsGuarded()
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not sync rewards with the registry."
      setClaimError(message)
      return
    }
    setPlayer(clearPendingRewards(player))
    eventBus.emit(GAME_EVENTS.REWARDS_CLAIMED, {
      playerId: userId ?? player.id,
    })
    if (userId) await hydratePlayerFromDb(userId)
  }, [player, setPlayer, userId])

  return { claimRewards, claimError }
}
