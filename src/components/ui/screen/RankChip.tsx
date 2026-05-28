interface RankChipProps {
  rank: string
  tone?: "accent" | "muted" | "locked"
}

export function RankChip({ rank, tone = "accent" }: RankChipProps) {
  const styles =
    tone === "locked"
      ? "border-[var(--border-subtle)] text-[var(--muted)]"
      : tone === "muted"
        ? "border-[var(--border-subtle)] text-[var(--muted)]"
        : "border-[var(--accent)]/50 text-[var(--accent-bright)] bg-[var(--accent)]/10"

  return (
    <span
      className={`inline-flex items-center rounded px-2 py-0.5 font-display text-[10px] font-semibold uppercase tracking-wider border ${styles}`}
    >
      {rank}
    </span>
  )
}
