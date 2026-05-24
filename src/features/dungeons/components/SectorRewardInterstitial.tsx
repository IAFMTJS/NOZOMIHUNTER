"use client"

import type { QuestContract } from "@/contracts/quest-contract"
import { Button } from "@/components/ui/Button"
import { RewardRow } from "@/components/ui/screen/RewardRow"

interface SectorRewardInterstitialProps {
  quest: QuestContract
  disabled?: boolean
  onContinue: () => Promise<void>
}

export function SectorRewardInterstitial({
  quest,
  disabled,
  onContinue,
}: SectorRewardInterstitialProps) {
  const run = quest.dungeonRun
  const cleared = run?.dungeon.encounters.filter((e) => e.completed).length ?? 0
  const total = run?.dungeon.encounters.length ?? 0
  const xpPreview = Math.round((quest.rewards.xp ?? 0) / Math.max(1, total))

  return (
    <div className="nozomi-embedded-accent flex flex-col gap-4 rounded-xl p-4">
      <p className="font-display text-xs uppercase tracking-[0.28em] text-[var(--reward)]">
        Sector cleared
      </p>
      <p className="text-sm text-[var(--muted)]">
        Breach {cleared}/{total} secured. Corridor pressure easing — push deeper or
        prepare for warden response.
      </p>
      <RewardRow
        items={[
          {
            key: "sector-xp",
            label: `~${xpPreview} XP sector share`,
            tone: "xp",
          },
          ...(quest.rewards.credits
            ? [
                {
                  key: "credits",
                  label: `${Math.round((quest.rewards.credits ?? 0) / Math.max(1, total))} credits`,
                  tone: "credits" as const,
                },
              ]
            : []),
        ]}
      />
      <Button
        variant="primary"
        disabled={disabled}
        className="w-full"
        onClick={() => void onContinue()}
      >
        Continue corridor transit
      </Button>
    </div>
  )
}
