interface ListeningStationDisplayProps {
  primaryLabel?: string
  secondaryLabel?: string
}

export function ListeningStationDisplay({
  primaryLabel = "秋葉原",
  secondaryLabel = "Akihabara · Line 2",
}: ListeningStationDisplayProps) {
  return (
    <div className="nozomi-embedded rounded-xl border border-[var(--accent)]/20 px-4 py-6 text-center">
      <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--muted)]">
        Station intercept
      </p>
      <p className="font-japanese mt-3 text-3xl font-semibold text-[var(--foreground)]">
        {primaryLabel}
      </p>
      <p className="mt-2 text-xs text-[var(--accent-bright)]">{secondaryLabel}</p>
      <div className="mt-4 flex justify-center gap-6 text-[10px] uppercase tracking-widest text-[var(--muted)]">
        <span>← 上野</span>
        <span>新宿 →</span>
      </div>
    </div>
  )
}
