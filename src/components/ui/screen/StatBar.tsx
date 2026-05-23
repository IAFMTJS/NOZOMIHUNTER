interface StatBarProps {
  label: string
  value: number
  max: number
  tone?: "accent" | "danger" | "reward"
}

export function StatBar({
  label,
  value,
  max,
  tone = "accent",
}: StatBarProps) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0
  const fill =
    tone === "danger"
      ? "from-[var(--danger)] to-[var(--warning)]"
      : tone === "reward"
        ? "from-[var(--reward)] to-[var(--warning)]"
        : "from-[var(--accent)] to-[var(--accent-bright)]"

  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className="text-[var(--foreground)]">{label}</span>
        <span className="tabular-nums text-[var(--muted)]">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-black/50">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${fill}`}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
    </div>
  )
}
