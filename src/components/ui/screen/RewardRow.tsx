interface RewardItem {
  key: string
  label: string
  quantity?: number
  tone?: "xp" | "credits" | "item"
}

interface RewardRowProps {
  items: RewardItem[]
}

export function RewardRow({ items }: RewardRowProps) {
  if (items.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item.key}
          className={`inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-medium ${
            item.tone === "xp"
              ? "border-[var(--reward)]/40 bg-[var(--reward)]/15 text-[var(--reward)]"
              : item.tone === "credits"
                ? "border-white/20 bg-[var(--overlay-subtle)] text-[var(--foreground)]"
                : "border-[var(--accent)]/30 bg-[var(--accent)]/10 text-[var(--accent-bright)]"
          }`}
        >
          {item.label}
          {item.quantity != null && item.quantity > 1 && (
            <span className="opacity-70">×{item.quantity}</span>
          )}
        </span>
      ))}
    </div>
  )
}
