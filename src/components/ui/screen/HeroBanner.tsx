import type { DungeonTheme } from "@/contracts/dungeon-contract"
import { getDungeonThemeArt } from "@/config/dungeonThemeArt"

interface HeroBannerProps {
  title?: string
  rankLabel?: string
  theme?: DungeonTheme
  tall?: boolean
  className?: string
}

export function HeroBanner({
  title,
  rankLabel,
  theme,
  tall = false,
  className = "",
}: HeroBannerProps) {
  const art = theme ? getDungeonThemeArt(theme) : null
  const heightClass = tall ? "h-44 sm:h-52" : "h-32"

  return (
    <div
      className={`nozomi-scanlines-light relative overflow-hidden rounded-2xl ${heightClass} ${
        art
          ? `${art.gradientClass} ${art.vignetteClass}`
          : "bg-gradient-to-br from-[var(--accent)]/30 via-black/40 to-black/80"
      } ${className}`}
      aria-hidden={!title}
    >
      <div className="absolute inset-0 bg-[linear-gradient(105deg,transparent_40%,rgba(122,92,255,0.15)_50%,transparent_60%)]" />
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--background)]/80 via-transparent to-transparent" />
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
