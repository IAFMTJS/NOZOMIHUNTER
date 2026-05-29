"use client"

import type { DungeonRunSummary } from "@/contracts/dungeon-contract"

interface DungeonRunRecapProps {
  summary: DungeonRunSummary
}

export function DungeonRunRecap({ summary }: DungeonRunRecapProps) {
  return (
    <div className="mt-4 rounded border border-[var(--border-subtle)] p-3 text-sm">
      <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--accent-bright)]">
        Extraction recap
      </p>
      {summary.bossSealLabel && (
        <p className="mt-2 text-[var(--foreground)]">Boss seal: {summary.bossSealLabel}</p>
      )}
      {summary.techniqueLabel && (
        <p className="text-[var(--muted)]">Technique: {summary.techniqueLabel}</p>
      )}
      <p className="mt-2 text-[var(--muted)]">
        Run score: {summary.runScore}
        {summary.runGrade != null && (
          <span className="ml-2 font-mono text-[var(--reward)]">Grade {summary.runGrade}</span>
        )}
        {summary.peakCorruption != null && (
          <span className="ml-2">· Peak corruption {summary.peakCorruption}%</span>
        )}
        {summary.sectorsCleared != null && (
          <span className="ml-2">· Sectors {summary.sectorsCleared}</span>
        )}
      </p>
      {summary.wordsBound.length > 0 && (
        <div className="mt-2">
          <p className="text-xs uppercase text-[var(--accent)]">Words bound</p>
          <ul className="mt-1 list-inside list-disc text-[var(--foreground)]">
            {summary.wordsBound.map((w) => (
              <li key={w.wordId}>
                {w.label} — {w.fantasyState}
              </li>
            ))}
          </ul>
        </div>
      )}
      {summary.weakSignals.length > 0 && (
        <div className="mt-2">
          <p className="text-xs uppercase text-[var(--danger)]">Weak signals</p>
          <ul className="mt-1 list-inside list-disc text-[var(--muted)]">
            {summary.weakSignals.map((w) => (
              <li key={w.wordId}>
                {w.label} — {w.fantasyState}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
