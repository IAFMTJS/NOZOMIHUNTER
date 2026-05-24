"use client"

import { motion, AnimatePresence } from "framer-motion"
import type { DungeonRunContract, ExplorationAction } from "@/contracts/dungeon-contract"
import { Button } from "@/components/ui/Button"
import {
  explorationBeatLabel,
  isReadyToEngage,
  sectorIntelHint,
  isPursuitCaught,
} from "@/systems/dungeons/explorationSystem"
import {
  encounterTypeGlyph,
  encounterTypeLabel,
} from "@/systems/dungeons/dungeonPresentationSystem"
import { MOTION } from "@/config/motionPresets"

const BEATS = ["APPROACH", "SCAN", "ENGAGE"] as const

interface CorridorStageProps {
  run: DungeonRunContract
  disabled?: boolean
  statusLine?: string | null
  onAdvance: (action: ExplorationAction) => Promise<void>
  onEngage: () => Promise<void>
}

export function CorridorStage({
  run,
  disabled,
  statusLine,
  onAdvance,
  onEngage,
}: CorridorStageProps) {
  const beat = run.explorationBeat ?? "APPROACH"
  const progress = run.explorationProgress ?? 0
  const ready = isReadyToEngage(run)
  const intel = sectorIntelHint(run)
  const activeSlot = run.dungeon.encounters[run.currentEncounterIndex]
  const nextType = activeSlot?.type
  const pursuitBlocked =
    run.dungeonMode === "VOID_PURSUIT" && isPursuitCaught(run.pursuitDistance)

  return (
    <div className="nozomi-corridor-stage flex flex-col gap-4">
      <div className="nozomi-corridor-viewport relative overflow-hidden rounded-xl border border-[var(--border-subtle)] p-4">
        <div className="nozomi-corridor-grid pointer-events-none absolute inset-0" aria-hidden />
        <div className="nozomi-corridor-horizon pointer-events-none absolute inset-x-0 top-0 h-24" aria-hidden />

        <p className="relative text-[10px] uppercase tracking-[0.28em] text-[var(--accent-bright)]">
          Corridor transit
        </p>
        <p className="relative mt-1 font-display text-xl text-[var(--foreground)]">
          {explorationBeatLabel(beat)}
        </p>

        <ol className="relative mt-4 flex gap-2" aria-label="Traversal beats">
          {BEATS.map((b) => {
            const idx = BEATS.indexOf(b)
            const currentIdx = BEATS.indexOf(beat as (typeof BEATS)[number])
            const done = idx < currentIdx || (ready && b === "ENGAGE")
            const active = b === beat
            return (
              <li
                key={b}
                className={`nozomi-beat-pip flex-1 rounded-full py-1 text-center text-[9px] uppercase tracking-[0.18em] transition-colors ${
                  done
                    ? "bg-[var(--accent)]/30 text-[var(--accent-bright)]"
                    : active
                      ? "bg-[var(--accent)]/20 text-[var(--foreground)] ring-1 ring-[var(--accent)]/50"
                      : "bg-white/5 text-[var(--muted)]"
                }`}
              >
                {b}
              </li>
            )
          })}
        </ol>

        <div className="relative mt-4 h-2.5 overflow-hidden rounded-full bg-black/50 ring-1 ring-white/10">
          <motion.div
            className="nozomi-corridor-progress h-full rounded-full bg-gradient-to-r from-[var(--accent)] via-[var(--accent-bright)] to-[var(--reward)]"
            initial={false}
            animate={{ width: `${Math.min(100, progress)}%` }}
            transition={MOTION.panel}
          />
        </div>
        <p className="relative mt-2 text-xs tabular-nums text-[var(--muted)]">
          Depth {progress}%
        </p>

        {nextType && (
          <div className="relative mt-4 flex items-center gap-3 rounded-lg border border-white/10 bg-black/40 px-3 py-2">
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[var(--accent)]/40 bg-[var(--accent-dim)] font-display text-lg text-[var(--accent-bright)]"
              aria-hidden
            >
              {encounterTypeGlyph(nextType)}
            </span>
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">
                Next breach
              </p>
              <p className="text-sm font-medium text-[var(--foreground)]">
                {encounterTypeLabel(nextType)}
              </p>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {statusLine && (
          <motion.p
            key={statusLine}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="nozomi-system-line border-l-2 border-[var(--accent)] pl-3 text-sm italic text-[var(--foreground)]/90"
          >
            {statusLine}
          </motion.p>
        )}
      </AnimatePresence>

      {intel && (
        <p className="rounded-lg border border-[var(--accent)]/25 bg-[var(--accent-dim)]/80 px-3 py-2 text-xs leading-relaxed text-[var(--accent-bright)]">
          <span className="mr-1 uppercase tracking-wider text-[var(--muted)]">Intel ·</span>
          {intel}
        </p>
      )}

      {pursuitBlocked && (
        <p className="text-sm text-[var(--danger)]">
          Hostile has closed distance — retreat or stabilize before breach.
        </p>
      )}

      {!ready ? (
        <div className="grid gap-2 sm:grid-cols-2">
          <Button
            variant="ghost"
            disabled={disabled}
            className="nozomi-corridor-action !border-[var(--accent)]/30"
            onClick={() => void onAdvance("LISTEN")}
          >
            <span className="block text-[10px] uppercase tracking-[0.2em] text-[var(--muted)]">
              Hold channel
            </span>
            Listen
          </Button>
          <Button
            variant="primary"
            disabled={disabled || pursuitBlocked}
            className="nozomi-corridor-action shadow-[0_0_20px_var(--glow-accent)]"
            onClick={() => void onAdvance("PUSH")}
          >
            <span className="block text-[10px] uppercase tracking-[0.2em] text-white/70">
              Advance
            </span>
            Push forward
          </Button>
        </div>
      ) : (
        <Button
          variant="primary"
          disabled={disabled || pursuitBlocked}
          className="w-full !py-3.5 text-base shadow-[0_0_24px_var(--glow-accent)]"
          onClick={() => void onEngage()}
        >
          Breach sector
        </Button>
      )}
    </div>
  )
}
