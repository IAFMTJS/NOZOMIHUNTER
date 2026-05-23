interface PowerComparisonProps {
  recommended: number
  yours: number
}

export function PowerComparison({ recommended, yours }: PowerComparisonProps) {
  const ratio = recommended > 0 ? yours / recommended : 1
  const tone =
    ratio >= 1
      ? "text-[var(--success)]"
      : ratio >= 0.85
        ? "text-[var(--warning)]"
        : "text-[var(--danger)]"

  return (
    <div className="grid grid-cols-2 gap-3 rounded-xl border border-[var(--border-subtle)] bg-black/20 p-4 text-center">
      <div>
        <p className="text-[10px] uppercase tracking-widest text-[var(--muted)]">
          Recommended power
        </p>
        <p className="font-mono text-xl font-semibold tabular-nums text-[var(--foreground)]">
          {recommended.toLocaleString()}
        </p>
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-widest text-[var(--muted)]">
          Your power
        </p>
        <p className={`font-mono text-xl font-semibold tabular-nums ${tone}`}>
          {yours.toLocaleString()}
        </p>
      </div>
    </div>
  )
}
