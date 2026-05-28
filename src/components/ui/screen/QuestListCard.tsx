import Link from "next/link"
import { Button } from "@/components/ui/Button"
import { GlassCard } from "@/components/ui/GlassCard"

interface QuestListCardProps {
  title: string
  progressCurrent: number
  progressRequired: number
  rewardXp: number
  href?: string
  claimable?: boolean
  completed?: boolean
  onClaim?: () => void
}

export function QuestListCard({
  title,
  progressCurrent,
  progressRequired,
  rewardXp,
  href,
  claimable,
  completed,
  onClaim,
}: QuestListCardProps) {
  const pct =
    progressRequired > 0
      ? Math.min(100, (progressCurrent / progressRequired) * 100)
      : 0

  const content = (
    <GlassCard
      as="div"
      tone={claimable ? "reward" : completed ? "locked" : "default"}
      className="flex items-center gap-3 !p-3"
    >
      <HexQuestIcon claimable={claimable} completed={completed} />
      <div className="min-w-0 flex-1">
        <p className="font-display text-sm font-semibold text-[var(--foreground)]">
          {title}
        </p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--overlay-track)]">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${
              claimable
                ? "from-[var(--reward)] to-[var(--warning)]"
                : "from-[var(--accent)] to-[var(--accent-bright)]"
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <p className="mt-1 text-[10px] text-[var(--muted)]">
          {progressCurrent}/{progressRequired}
        </p>
      </div>
      <div className="shrink-0 text-right">
        {claimable && onClaim ? (
          <Button variant="cta" size="sm" onClick={onClaim} className="!min-h-8 !px-3 text-xs">
            Claim
          </Button>
        ) : (
          <p className="font-display text-xs font-bold text-[var(--reward)]">
            XP {rewardXp}
          </p>
        )}
      </div>
    </GlassCard>
  )

  if (href && !claimable) {
    return (
      <Link href={href} className="block transition-opacity hover:opacity-90">
        {content}
      </Link>
    )
  }

  return content
}

function HexQuestIcon({
  claimable,
  completed,
}: {
  claimable?: boolean
  completed?: boolean
}) {
  const stroke = claimable
    ? "var(--reward)"
    : completed
      ? "var(--muted)"
      : "var(--accent-bright)"

  return (
    <div
      className="flex h-11 w-11 shrink-0 items-center justify-center"
      aria-hidden
    >
      <svg viewBox="0 0 44 44" className="h-11 w-11">
        <polygon
          points="22,2 40,12 40,32 22,42 4,32 4,12"
          fill="var(--accent-a12)"
          stroke={stroke}
          strokeWidth="1.5"
        />
        <path
          d="M22 14v16M14 22h16"
          stroke={stroke}
          strokeWidth="1.75"
          strokeLinecap="round"
          opacity={completed ? 0.4 : 0.9}
        />
      </svg>
    </div>
  )
}