"use client"

import { SYNCHRONIZATION_CONFIG } from "@/config/synchronizationConfig"

interface SyncDisciplineChestTeaserProps {
  chainDays: number
}

export function SyncDisciplineChestTeaser({ chainDays }: SyncDisciplineChestTeaserProps) {
  const next = SYNCHRONIZATION_CONFIG.MILESTONES.find((m) => chainDays < m.days)
  if (!next) {
    return (
      <div className="mt-3 flex items-center gap-3 rounded-lg border border-[var(--reward)]/30 bg-[var(--reward)]/5 px-3 py-2">
        <ChestIcon sealed={false} />
        <p className="text-xs text-[var(--reward)]">Discipline cache maxed — titles secured.</p>
      </div>
    )
  }

  const remaining = Math.max(0, next.days - chainDays)
  const pct = Math.min(100, Math.round((chainDays / next.days) * 100))

  return (
    <div className="mt-3 flex items-center gap-3">
      <div className="relative flex h-12 w-12 items-center justify-center">
        <svg viewBox="0 0 48 48" className="absolute inset-0 h-full w-full -rotate-90">
          <circle
            cx="24"
            cy="24"
            r="20"
            fill="none"
            stroke="var(--border-subtle)"
            strokeWidth="3"
          />
          <circle
            cx="24"
            cy="24"
            r="20"
            fill="none"
            stroke="var(--reward)"
            strokeWidth="3"
            strokeDasharray={`${(pct / 100) * 125.6} 125.6`}
            strokeLinecap="round"
          />
        </svg>
        <ChestIcon sealed={remaining > 0} />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--reward)]">
          Discipline cache
        </p>
        <p className="text-xs text-[var(--muted)]">
          {remaining === 0
            ? "Milestone reached — ceremony pending."
            : `${remaining} day${remaining === 1 ? "" : "s"} to ${next.days}d sync target`}
        </p>
      </div>
    </div>
  )
}

function ChestIcon({ sealed }: { sealed: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5 text-[var(--reward)]" aria-hidden>
      <rect x="4" y="10" width="16" height="10" rx="1" fill="currentColor" opacity="0.35" />
      <path
        d="M4 10V8a2 2 0 012-2h12a2 2 0 012 2v2M12 10v4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      {sealed && (
        <circle cx="12" cy="14" r="2" fill="currentColor" opacity="0.8" />
      )}
    </svg>
  )
}


