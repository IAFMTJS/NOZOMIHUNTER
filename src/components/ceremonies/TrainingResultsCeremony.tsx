"use client"

import Link from "next/link"
import type { TrainingSessionSummaryViewModel } from "@/systems/training/trainingSessionSummarySystem"
import { CeremonyOverlay } from "@/components/ceremonies/CeremonyOverlay"
import { Button } from "@/components/ui/Button"

interface TrainingResultsCeremonyProps {
  summary: TrainingSessionSummaryViewModel
  playAgainHref: string
  onDismiss: () => void
}

export function TrainingResultsCeremony({
  summary,
  playAgainHref,
  onDismiss,
}: TrainingResultsCeremonyProps) {
  return (
    <CeremonyOverlay open intensity="default" ariaLabelledBy="training-results-title">
      <div className="nozomi-training-results mx-auto max-w-sm space-y-4 text-center">
        <p className="text-[10px] uppercase tracking-widest text-[var(--reward)]">
          Drill complete
        </p>
        <h2
          id="training-results-title"
          className="font-display text-2xl text-[var(--foreground)]"
        >
          {summary.modeLabel}
        </h2>
        <ul className="grid grid-cols-2 gap-3 text-left text-sm">
          <li className="rounded-lg border border-[var(--border-subtle)] p-3">
            <span className="text-[var(--muted)]">XP</span>
            <p className="font-mono text-lg text-[var(--reward)]">+{summary.xpGained}</p>
          </li>
          <li className="rounded-lg border border-[var(--border-subtle)] p-3">
            <span className="text-[var(--muted)]">Discipline</span>
            <p className="font-mono text-lg text-[var(--accent-bright)]">
              +{summary.disciplineGained}
            </p>
          </li>
          <li className="rounded-lg border border-[var(--border-subtle)] p-3">
            <span className="text-[var(--muted)]">Accuracy</span>
            <p className="font-mono text-lg">{summary.accuracyPercent}%</p>
          </li>
          <li className="rounded-lg border border-[var(--border-subtle)] p-3">
            <span className="text-[var(--muted)]">Combo peak</span>
            <p className="font-mono text-lg">x{summary.comboPeak}</p>
          </li>
        </ul>
        <div className="flex flex-col gap-2">
          <Link href={playAgainHref}>
            <Button variant="cta" className="w-full">
              Play again
            </Button>
          </Link>
          <Button variant="ghost" className="w-full" onClick={onDismiss}>
            Return to training
          </Button>
        </div>
      </div>
    </CeremonyOverlay>
  )
}
