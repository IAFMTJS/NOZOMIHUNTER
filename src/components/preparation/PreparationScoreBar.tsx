interface PreparationScoreBarProps {
  score: number
  label?: string
}

export function PreparationScoreBar({
  score,
  label = "Mission readiness",
}: PreparationScoreBarProps) {
  const clamped = Math.min(100, Math.max(0, score))
  const tone =
    clamped >= 75
      ? "from-[var(--success)]/80 to-[var(--accent)]"
      : clamped >= 45
        ? "from-[var(--warning)]/60 to-[var(--accent)]"
        : "from-[var(--danger)]/70 to-[var(--warning)]/50"

  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs uppercase tracking-widest text-[var(--muted)]">
          {label}
        </span>
        <span className="font-mono text-lg font-semibold tabular-nums text-[var(--foreground)]">
          {clamped}%
        </span>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full border border-white/10 bg-black/40"
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${label}: ${clamped}%`}
      >
        <div
          className={`h-full rounded-full bg-gradient-to-r ${tone} transition-all duration-500`}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  )
}
