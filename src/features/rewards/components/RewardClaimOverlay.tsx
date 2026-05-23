"use client"

import type { PendingRewardBundleContract } from "@/contracts/economy-contract"
import type { PlayerContract } from "@/contracts/player-contract"
import { Button } from "@/components/ui/Button"
import { XPBar } from "@/components/XPBar"
import { xpProgressInCurrentLevel } from "@/systems/progression/levelSystem"

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
  const progress = xpProgressInCurrentLevel(player.xp, player.level)

  return (
    <div className="fixed inset-0 z-[110] flex items-end justify-center bg-black/80 p-4 pb-[calc(var(--hunter-nav-height)+1rem)] sm:items-center">
      <div className="nozomi-embedded-accent w-full max-w-md rounded-2xl p-6">
        <p className="font-display text-xs uppercase tracking-[0.28em] text-[var(--reward)]">
          Extraction complete
        </p>
        <p className="mt-2 font-display text-4xl font-bold text-[var(--foreground)]">
          +{bundle.xpGained} XP
        </p>
        <div className="mt-4">
          <XPBar
            currentXP={progress.current}
            requiredXP={progress.required}
            level={player.level}
            xpDebt={player.penalties.xpDebt}
          />
        </div>
        <ul className="mt-6 space-y-2 text-sm text-[var(--muted)]">
          {bundle.credits != null && bundle.credits > 0 && (
            <li>Credits +{bundle.credits}</li>
          )}
          {bundle.items.map((item) => (
            <li key={item.itemKey}>
              {item.itemKey} ×{item.quantity}
            </li>
          ))}
        </ul>
        {claimError && (
          <p className="mt-4 text-center text-sm text-[var(--danger)]">{claimError}</p>
        )}
        <Button
          variant="primary"
          size="md"
          className="mt-6 w-full !border-[var(--accent)] !bg-gradient-to-r !from-[var(--accent)]/30 !to-transparent !py-3 !text-base shadow-[0_0_20px_var(--glow-accent)]"
          onClick={onClaimAll}
        >
          Claim all
        </Button>
      </div>
    </div>
  )
}
