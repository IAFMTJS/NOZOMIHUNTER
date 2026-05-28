export interface RewardIconItem {
  key: string
  label: string
  sublabel?: string
  tone?: "xp" | "credits" | "item" | "neutral"
}

interface RewardIconGridProps {
  items: RewardIconItem[]
}

const TONE_CLASS: Record<NonNullable<RewardIconItem["tone"]>, string> = {
  xp: "border-[var(--reward)]/35 bg-[var(--reward)]/10 text-[var(--reward)]",
  credits:
    "border-white/15 bg-[var(--overlay-subtle)] text-[var(--foreground)]",
  item: "border-[var(--accent)]/30 bg-[var(--accent)]/10 text-[var(--accent-bright)]",
  neutral: "border-[var(--border-subtle)] bg-[var(--overlay-panel-strong)] text-[var(--muted)]",
}

export function RewardIconGrid({ items }: RewardIconGridProps) {
  if (items.length === 0) return null

  return (
    <div className="grid grid-cols-4 gap-2">
      {items.map((item) => (
        <div
          key={item.key}
          className={`flex aspect-square flex-col items-center justify-center rounded-xl border px-1 py-2 text-center ${
            TONE_CLASS[item.tone ?? "neutral"]
          }`}
        >
          <span className="font-display text-[10px] font-bold uppercase tracking-wider">
            {item.label}
          </span>
          {item.sublabel && (
            <span className="mt-1 text-[9px] opacity-80">{item.sublabel}</span>
          )}
        </div>
      ))}
    </div>
  )
}
