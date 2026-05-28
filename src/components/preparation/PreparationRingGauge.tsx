interface PreparationRingGaugeProps {
  score: number
  label?: string
}

export function PreparationRingGauge({
  score,
  label = "Operational readiness",
}: PreparationRingGaugeProps) {
  const clamped = Math.min(100, Math.max(0, score))
  const circumference = 2 * Math.PI * 54
  const offset = circumference - (clamped / 100) * circumference

  return (
    <div className="flex flex-col items-center py-4">
      <div className="relative h-36 w-36">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="var(--overlay-muted)"
            strokeWidth="8"
          />
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="url(#prepGrad)"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-700"
          />
          <defs>
            <linearGradient id="prepGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="var(--accent)" />
              <stop offset="100%" stopColor="var(--accent-bright)" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-3xl font-bold tabular-nums text-[var(--foreground)]">
            {clamped}%
          </span>
        </div>
      </div>
      <p className="mt-3 text-xs uppercase tracking-widest text-[var(--muted)]">
        {label}
      </p>
    </div>
  )
}
