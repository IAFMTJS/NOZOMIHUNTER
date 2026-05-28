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

  const shellClass =
    ceremony.tier === "light"
      ? "nozomi-reward-shell--light max-w-sm nozomi-reward-tier--light"
      : ceremony.tier === "medium"
        ? "nozomi-reward-shell--medium max-w-md nozomi-reward-tier--medium"
        : "nozomi-reward-shell--full max-w-lg w-full min-h-[70vh] sm:min-h-0 nozomi-reward-tier--full"

  const tierSubhead =
    ceremony.tier === "light"
      ? "Routine sync complete"
      : ceremony.tier === "medium"
        ? "Side contract resolved"
        : "Mission extraction authorized"

  return (
    <div
      className={`fixed inset-0 z-[110] flex items-end justify-center p-4 pb-[calc(var(--hunter-nav-height)+1rem)] sm:items-center ${
        ceremony.tier === "light"
          ? "bg-[var(--overlay-backdrop-light)]"
          : ceremony.tier === "medium"
            ? "bg-[var(--overlay-backdrop)]"
            : "bg-[var(--overlay-modal)] nozomi-reward-backdrop--heavy"
      }`}
    >
      <div className={`nozomi-embedded-accent w-full rounded-2xl p-4 ${shellClass}`}>
        <GateClearedScreen
          stats={stats}
          rewards={rewards}
          revealMode={ceremony.revealMode}
          headline={headline}
          subheadline={ceremony.sourceTitle ?? tierSubhead}
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
