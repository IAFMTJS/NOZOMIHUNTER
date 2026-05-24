"use client"

import type { PendingRewardBundleContract } from "@/contracts/economy-contract"
import type { PlayerContract } from "@/contracts/player-contract"
import { GateClearedScreen } from "@/features/dungeons/components/GateClearedScreen"
import {
  buildGateClearedStats,
  rewardsFromPendingBundle,
} from "@/systems/presentation/gateClearedPresentation"

interface RewardClaimOverlayProps {
  player: PlayerContract
  bundle: PendingRewardBundleContract
  claimError?: string | null
  onClaimAll: () => void
}

export function RewardClaimOverlay({
  player,
  bundle,
  claimError,
  onClaimAll,
}: RewardClaimOverlayProps) {
  const stats = buildGateClearedStats(bundle)
  const rewards = rewardsFromPendingBundle(bundle)

  return (
    <div className="fixed inset-0 z-[110] flex items-end justify-center bg-black/85 p-4 pb-[calc(var(--hunter-nav-height)+1rem)] sm:items-center">
      <div className="nozomi-embedded-accent w-full max-w-md rounded-2xl p-4">
        <GateClearedScreen stats={stats} rewards={rewards} onContinue={onClaimAll} />
        {claimError && (
          <p className="mt-3 text-center text-sm text-[var(--danger)]">{claimError}</p>
        )}
        <p className="sr-only">
          Hunter {player.username} level {player.level}
        </p>
      </div>
    </div>
  )
}
