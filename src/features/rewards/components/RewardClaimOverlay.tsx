"use client"

import type { PendingRewardBundleContract } from "@/contracts/economy-contract"
import type { PlayerContract } from "@/contracts/player-contract"
import type { QuestContract } from "@/contracts/quest-contract"
import { GateClearedScreen } from "@/features/dungeons/components/GateClearedScreen"
import {
  buildGateClearedStats,
  rewardsFromPendingBundle,
} from "@/systems/presentation/gateClearedPresentation"
import {
  overlayIntensityClass,
  resolveCompletionCeremony,
} from "@/systems/presentation/ceremonies/completionCeremonyTierSystem"
import { performanceLabelFromStats } from "@/systems/presentation/ceremonies/dungeonClearCeremonyData"

interface RewardClaimOverlayProps {
  player: PlayerContract
  bundle: PendingRewardBundleContract
  activeQuests?: QuestContract[]
  claimError?: string | null
  onClaimAll: () => void
}

export function RewardClaimOverlay({
  player,
  bundle,
  activeQuests = [],
  claimError,
  onClaimAll,
}: RewardClaimOverlayProps) {
  const ceremony = resolveCompletionCeremony(bundle, activeQuests)
  const quest = bundle.questId
    ? activeQuests.find((q) => q.id === bundle.questId)
    : undefined
  const failures = quest?.dungeonRun?.encounterFailures ?? 0
  const stats = buildGateClearedStats(bundle, {
    accuracyPercent: Math.max(55, 100 - failures * 12),
  })
  const rewards = rewardsFromPendingBundle(bundle)
  const performanceLabel =
    ceremony.tier === "dungeon" || ceremony.tier === "full"
      ? performanceLabelFromStats(stats, failures)
      : undefined

  const headline =
    ceremony.tier === "dungeon"
      ? "Dungeon Cleared"
      : ceremony.tier === "light"
        ? "Contract synced"
        : "Gate Cleared"

  return (
    <div className="fixed inset-0 z-[110] flex items-end justify-center bg-black/85 p-4 pb-[calc(var(--hunter-nav-height)+1rem)] sm:items-center">
      <div className="nozomi-embedded-accent w-full max-w-md rounded-2xl p-4">
        <GateClearedScreen
          stats={stats}
          rewards={rewards}
          revealMode={ceremony.revealMode}
          headline={headline}
          subheadline={ceremony.sourceTitle}
          performanceLabel={performanceLabel}
          intensityClass={overlayIntensityClass(ceremony.tier)}
          onContinue={onClaimAll}
        />
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
