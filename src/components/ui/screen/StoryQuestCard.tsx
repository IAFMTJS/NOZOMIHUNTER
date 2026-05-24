import Link from "next/link"
import { StatusChip } from "@/components/ui/StatusChip"

export type StoryQuestCardState = "active" | "locked" | "complete"

interface StoryQuestCardProps {
  index: number
  title: string
  titleJa?: string
  sectorBlurb?: string
  dangerTier?: string
  progressCurrent: number
  progressRequired: number
  rewardXp: number
  state: StoryQuestCardState
  href?: string
}

export function StoryQuestCard({
  index,
  title,
  titleJa,
  sectorBlurb,
  dangerTier,
  progressCurrent,
  progressRequired,
  rewardXp,
  state,
  href,
}: StoryQuestCardProps) {
  const pct =
    progressRequired > 0
      ? Math.min(100, (progressCurrent / progressRequired) * 100)
      : 0
  const locked = state === "locked"
  const complete = state === "complete"

  const inner = (
    <div
      className={`flex items-center gap-3 rounded-xl border px-3 py-3 transition-all ${
        locked
          ? "border-[var(--border-subtle)] bg-black/20 opacity-55"
          : complete
            ? "border-[var(--border-subtle)] bg-black/25"
            : "border-[var(--accent)]/40 bg-[var(--accent-dim)] shadow-[0_0_20px_var(--glow-accent)]"
      }`}
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg font-display text-sm font-bold ${
          locked
            ? "bg-black/40 text-[var(--muted)]"
            : "bg-[var(--accent)]/20 text-[var(--accent-bright)]"
        }`}
      >
        {String(index).padStart(2, "0")}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-display text-sm font-semibold leading-snug text-[var(--foreground)]">
          {title}
        </p>
        {titleJa && (
          <p className="font-japanese mt-0.5 text-xs text-[var(--muted)]">{titleJa}</p>
        )}
        {sectorBlurb && (
          <p className="mt-1 text-[10px] leading-snug text-[var(--muted)]">{sectorBlurb}</p>
        )}
        {dangerTier && (
          <span className="mt-1 inline-block text-[9px] uppercase tracking-wider text-[var(--warning)]">
            {dangerTier}
          </span>
        )}
        {!locked && (
          <div className="mt-2 h-1 overflow-hidden rounded-full bg-black/50">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${
                complete
                  ? "from-[var(--success)]/80 to-[var(--success)]"
                  : "from-[var(--accent)] to-[var(--accent-bright)]"
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>
        )}
      </div>
      <div className="shrink-0 text-right">
        {locked ? (
          <StatusChip label="Locked" tone="neutral" />
        ) : (
          <p className="font-display text-xs font-bold text-[var(--reward)]">+{rewardXp} XP</p>
        )}
      </div>
    </div>
  )

  if (href && !locked) {
    return (
      <Link href={href} className="block hover:opacity-95">
        {inner}
      </Link>
    )
  }

  return inner
}
