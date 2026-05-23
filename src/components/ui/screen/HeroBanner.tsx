interface HeroBannerProps {
  title?: string
  rankLabel?: string
  className?: string
}

export function HeroBanner({ title, rankLabel, className = "" }: HeroBannerProps) {
  return (
    <div
      className={`nozomi-scanlines-light relative h-32 overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--accent)]/30 via-black/40 to-black/80 ${className}`}
      aria-hidden={!title}
    >
      <div className="absolute inset-0 bg-[linear-gradient(105deg,transparent_40%,rgba(122,92,255,0.15)_50%,transparent_60%)]" />
      {rankLabel && (
        <span className="absolute left-3 top-3 rounded bg-black/50 px-2 py-0.5 font-display text-[10px] uppercase tracking-widest text-[var(--accent-bright)]">
          Rank {rankLabel}
        </span>
      )}
      {title && (
        <p className="absolute bottom-3 left-3 font-display text-lg font-semibold text-white/90">
          {title}
        </p>
      )}
    </div>
  )
}
