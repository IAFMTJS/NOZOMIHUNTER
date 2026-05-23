import type {
  HunterRank,
  SynchronizationStatus,
} from "@/contracts/player-contract"

interface HunterPortraitProps {
  className?: string
  rank?: HunterRank
  codename?: string
  corruption?: number
  syncStatus?: SynchronizationStatus
}

function rankRingClass(rank?: HunterRank): string {
  switch (rank) {
    case "S":
      return "stroke-[var(--reward)]"
    case "A":
    case "B":
      return "stroke-[var(--accent-bright)]"
    case "C":
    case "D":
      return "stroke-[var(--accent)]"
    default:
      return "stroke-[var(--muted)]"
  }
}

export function HunterPortrait({
  className = "",
  rank,
  codename,
  corruption = 0,
  syncStatus,
}: HunterPortraitProps) {
  const corruptHigh = corruption >= 50
  const corruptLow = corruption >= 25 && !corruptHigh
  const syncAtRisk = syncStatus === "AT_RISK"

  return (
    <div
      className={`nozomi-hunter-portrait-slot relative h-20 w-20 shrink-0 ${className}`}
      role="img"
      aria-label={
        codename
          ? `Hunter portrait, rank ${rank ?? "unknown"}, ${codename}`
          : "Hunter portrait"
      }
    >
      {/* Base silhouette */}
      <svg
        viewBox="0 0 80 80"
        className="absolute inset-0 h-full w-full rounded-[var(--radius-panel)]"
        aria-hidden
      >
        <defs>
          <linearGradient id="portrait-fill" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(122, 92, 255, 0.35)" />
            <stop offset="100%" stopColor="rgba(5, 7, 11, 0.9)" />
          </linearGradient>
        </defs>
        <rect
          width="80"
          height="80"
          rx="6"
          fill="url(#portrait-fill)"
        />
        <path
          d="M40 14c-8 0-14 6-14 14v4c0 4 2 8 6 10l-4 22h24l-4-22c4-2 6-6 6-10v-4c0-8-6-14-14-14z"
          fill="rgba(243, 245, 255, 0.12)"
          stroke="rgba(243, 245, 255, 0.2)"
          strokeWidth="1"
        />
        <circle cx="40" cy="26" r="9" fill="rgba(243, 245, 255, 0.08)" />
      </svg>

      {/* Rank ring */}
      <svg
        viewBox="0 0 80 80"
        className={`pointer-events-none absolute inset-0 h-full w-full ${rankRingClass(rank)}`}
        aria-hidden
      >
        <circle
          cx="40"
          cy="40"
          r="36"
          fill="none"
          strokeWidth="2"
          className={rankRingClass(rank)}
          opacity={0.85}
        />
      </svg>

      {/* Corruption overlay */}
      {(corruptLow || corruptHigh) && (
        <div
          className={`pointer-events-none absolute inset-0 rounded-[inherit] ${
            corruptHigh
              ? "nozomi-portrait-corrupt bg-[var(--corruption)]/15"
              : "nozomi-portrait-corrupt-low bg-[var(--corruption)]/8"
          }`}
          aria-hidden
        />
      )}

      {/* Sync pulse */}
      {syncAtRisk && (
        <div
          className="pointer-events-none absolute -inset-0.5 rounded-[inherit] ring-1 ring-[var(--warning)]/50 nozomi-sync-at-risk"
          aria-hidden
        />
      )}

      {/* Rank badge */}
      <span className="absolute bottom-1 right-1 rounded bg-black/60 px-1.5 py-0.5 font-display text-sm font-bold text-[var(--foreground)]">
        {rank ?? "?"}
      </span>

      {/* Scanlines on high corruption */}
      {corruptHigh && (
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit] opacity-40 nozomi-scanlines-light"
          aria-hidden
        />
      )}
    </div>
  )
}
