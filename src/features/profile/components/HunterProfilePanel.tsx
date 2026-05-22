"use client"

import Link from "next/link"
import type { PlayerContract } from "@/contracts/player-contract"
import { profileSummary } from "@/features/profile/profilePresentation"
import { XPBar } from "@/components/XPBar"
import { PenaltyStatus } from "@/components/PenaltyStatus"
import { Panel } from "@/components/ui/Panel"
import { xpProgressInCurrentLevel } from "@/systems/progression/levelSystem"

interface HunterProfilePanelProps {
  player: PlayerContract
}

export function HunterProfilePanel({ player }: HunterProfilePanelProps) {
  const progress = xpProgressInCurrentLevel(player.xp, player.level)
  const { systems, dungeons, titles } = profileSummary(player)

  return (
    <div className="space-y-6">
      <Panel tone="accent">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--accent-bright)]">
          Hunter registry
        </p>
        <p className="mt-2 font-display text-2xl font-bold text-[var(--foreground)]">
          {player.username}
        </p>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Rank {player.rank} · Level {player.level}
        </p>
      </Panel>

      <XPBar
        currentXP={progress.current}
        requiredXP={progress.required}
        level={player.level}
        xpDebt={player.penalties.xpDebt}
      />

      <PenaltyStatus penalties={player.penalties} />

      <Panel tone="default">
        <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">
          Combat stats
        </h2>
        <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
          {(
            [
              ["Vocabulary", player.stats.vocabulary],
              ["Grammar", player.stats.grammar],
              ["Listening", player.stats.listening],
              ["Speaking", player.stats.speaking],
              ["Confidence", player.stats.confidence],
              ["Consistency", player.stats.consistency],
            ] as const
          ).map(([label, value]) => (
            <div key={label}>
              <dt className="text-[var(--muted)]">{label}</dt>
              <dd className="font-medium text-[var(--foreground)]">{value}</dd>
            </div>
          ))}
        </dl>
      </Panel>

      <Panel tone="inset">
        <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">
          Unlocked systems
        </h2>
        <ul className="mt-3 space-y-1 text-sm text-[var(--muted)]">
          {systems.map((s) => (
            <li key={s.key}>{s.label}</li>
          ))}
        </ul>
      </Panel>

      <Panel tone="inset">
        <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">
          Corridors
        </h2>
        <ul className="mt-3 space-y-1 text-sm text-[var(--muted)]">
          {dungeons.map((d) => (
            <li key={d.key}>{d.label}</li>
          ))}
        </ul>
      </Panel>

      {titles.length > 0 && (
        <Panel tone="inset">
          <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">
            Titles
          </h2>
          <ul className="mt-3 space-y-1 text-sm text-[var(--muted)]">
            {titles.map((t) => (
              <li key={t.key}>{t.label}</li>
            ))}
          </ul>
        </Panel>
      )}

      <Link
        href="/dashboard"
        className="inline-flex text-sm text-[var(--accent-bright)] hover:underline"
      >
        ← Command node
      </Link>
    </div>
  )
}
