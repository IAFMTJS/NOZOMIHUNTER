"use client"

import type { DungeonRunContract } from "@/contracts/dungeon-contract"
import { StatusChip } from "@/components/ui/StatusChip"
import { formatDungeonTimeRemaining } from "@/systems/economy/shopEffectSystem"
import {
  dungeonFailureConsequenceLine,
  dungeonThemeAtmosphere,
  formatRunPressure,
  pursuitBarTone,
} from "@/systems/dungeons/dungeonPresentationSystem"
import { isPursuitCaught } from "@/systems/dungeons/explorationSystem"

interface DungeonRunHudProps {
  run: DungeonRunContract
  machineState: string
  sectorsDone: number
  sectorTotal: number
  timeRemainingMs: number | null
  maxStrikes?: number
  compact?: boolean
}

export function DungeonRunHud({
  run,
  machineState,
  sectorsDone,
  sectorTotal,
  timeRemainingMs,
  maxStrikes = 2,
  compact,
}: DungeonRunHudProps) {
  const strikesLeft = Math.max(0, maxStrikes - run.encounterFailures)
  const pressure = formatRunPressure(run)
  const pursuitDistance = run.pursuitDistance
  const showPursuit =
    run.dungeonMode === "VOID_PURSUIT" && pursuitDistance != null
  const pursuitTone = pursuitBarTone(pursuitDistance)
  const caught = showPursuit && isPursuitCaught(pursuitDistance)
  const consequence = dungeonFailureConsequenceLine(run, maxStrikes)
  const atmosphere = dungeonThemeAtmosphere(run.dungeon.theme)

  return (
    <header className={`nozomi-dungeon-hud flex flex-col gap-2 ${compact ? "gap-1.5" : "gap-2"}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <StatusChip
            label={pressure.modeLabel}
            tone={
              run.dungeonMode === "VOID_PURSUIT"
                ? "danger"
                : run.dungeonMode === "CORRUPTION_RUN"
                  ? "warning"
                  : "accent"
            }
          />
          <StatusChip
            label={machineState.replace(/_/g, " ")}
            tone={machineState === "BOSS" ? "danger" : "neutral"}
          />
        </div>
        {timeRemainingMs != null && run.runStartedAt && (
          <span
            className={`font-mono text-xs tabular-nums tracking-wider ${
              timeRemainingMs < 120_000 ? "text-[var(--danger)]" : "text-[var(--muted)]"
            }`}
          >
            {formatDungeonTimeRemaining(timeRemainingMs)}
          </span>
        )}
      </div>

      {!compact && (
        <p className="text-[10px] italic text-[var(--muted)]">{atmosphere}</p>
      )}

      {consequence && (
        <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--danger)]">
          {consequence}
        </p>
      )}

      <p className="text-[10px] uppercase tracking-[0.22em] text-[var(--muted)]">
        Sectors {sectorsDone}/{sectorTotal}
        {pressure.loopLabel ? ` · ${pressure.loopLabel}` : ""}
        <span
          className={
            strikesLeft <= 1 ? "ml-1 text-[var(--danger)]" : "ml-1 text-[var(--warning)]"
          }
        >
          · strikes {strikesLeft}/{maxStrikes}
        </span>
        {sectorsDone >= 2 && (
          <span className="nozomi-dungeon-escalation ml-1 text-[var(--danger)]">
            · pressure rising
          </span>
        )}
        {(run.peakEncounterStreak ?? 0) >= 3 && (
          <span className="ml-1 text-[var(--reward)]">
            · peak chain {run.peakEncounterStreak}
          </span>
        )}
      </p>

      {run.modifiers && run.modifiers.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {run.modifiers.map((m) => (
            <span
              key={m.id}
              className="nozomi-dungeon-mod-chip rounded border border-[var(--border-subtle)] bg-black/30 px-2 py-0.5 text-[10px] uppercase tracking-wide text-[var(--accent-bright)]"
            >
              {m.label}
            </span>
          ))}
        </div>
      )}

      {showPursuit && (
        <div className="nozomi-pursuit-track flex flex-col gap-1">
          <div className="flex justify-between text-[10px] uppercase tracking-[0.2em]">
            <span className="text-[var(--muted)]">Hostile proximity</span>
            <span
              className={
                caught
                  ? "text-[var(--danger)]"
                  : pursuitTone === "danger"
                    ? "text-[var(--danger)]"
                    : "text-[var(--accent-bright)]"
              }
            >
              {pressure.pursuitLabel}
            </span>
          </div>
          <div className="nozomi-pursuit-bar h-2 overflow-hidden rounded-full bg-white/8">
            <div
              className={`nozomi-pursuit-fill nozomi-pursuit-fill--${pursuitTone} h-full rounded-full transition-all duration-700`}
              style={{ width: `${Math.min(100, pursuitDistance ?? 0)}%` }}
            />
          </div>
        </div>
      )}
    </header>
  )
}
