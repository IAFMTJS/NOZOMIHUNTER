type RewardIconTone = "xp" | "credits" | "item" | "token"

interface RewardIconProps {
  label: string
  tone?: RewardIconTone
  quantity?: number
}

const TONE_CLASS: Record<RewardIconTone, string> = {
  xp: "border-[var(--reward)]/50 bg-[var(--reward)]/15 text-[var(--reward)]",
  credits: "border-white/20 bg-[var(--overlay-subtle)] text-[var(--foreground)]",
  item: "border-[var(--accent)]/40 bg-[var(--accent)]/15 text-[var(--accent-bright)]",
  token: "border-[var(--accent-bright)]/50 bg-[var(--accent)]/20 text-[var(--accent-bright)]",
}

export function RewardIcon({ label, tone = "item", quantity }: RewardIconProps) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={`flex h-12 w-12 flex-col items-center justify-center rounded-full border text-center ${TONE_CLASS[tone]}`}
      >
        <span className="font-display text-[9px] font-bold uppercase leading-tight">
          {label.slice(0, 8)}
        </span>
        {quantity != null && quantity > 1 && (
          <span className="text-[8px] opacity-70">×{quantity}</span>
        )}
      </div>
      <span className="max-w-[4rem] text-center text-[9px] text-[var(--muted)]">
        {label}
      </span>
    </div>
  )
}
