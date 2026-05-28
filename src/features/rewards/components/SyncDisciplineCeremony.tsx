"use client"

import { Button } from "@/components/ui/Button"
import { getUnlockLabel } from "@/config/unlockRegistry"

interface SyncDisciplineCeremonyProps {
  unlockKey: string
  chainDays: number
  onDismiss: () => void
}

export function SyncDisciplineCeremony({
  unlockKey,
  chainDays,
  onDismiss,
}: SyncDisciplineCeremonyProps) {
  const title = getUnlockLabel(unlockKey)

  return (
    <div className="fixed inset-0 z-[115] flex items-end justify-center bg-[var(--overlay-modal)] p-4 pb-[calc(var(--hunter-nav-height)+1rem)] sm:items-center">
      <div className="nozomi-embedded-accent w-full max-w-md rounded-2xl p-6">
        <p className="font-display text-xs uppercase tracking-[0.28em] text-[var(--reward)]">
          Discipline cache opened
        </p>
        <p className="mt-2 font-display text-2xl font-semibold text-[var(--foreground)]">
          {chainDays}-day synchronization
        </p>
        <p className="mt-3 text-sm text-[var(--muted)]">
          The system acknowledges sustained discipline. Registry title granted:
        </p>
        <p className="mt-2 font-display text-lg text-[var(--accent-bright)]">{title}</p>
        <Button
          variant="primary"
          size="md"
          className="mt-6 w-full !border-[var(--reward)]/50 !py-3"
          onClick={onDismiss}
        >
          Acknowledge
        </Button>
      </div>
    </div>
  )
}
