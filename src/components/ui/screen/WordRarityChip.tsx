export type WordRarityTier = "COMMON" | "UNCOMMON" | "RARE"

const TIER_CLASS: Record<WordRarityTier, string> = {
  COMMON: "border-[var(--success)]/30 bg-[var(--success)]/10 text-[var(--success)]",
  UNCOMMON: "border-[var(--warning)]/35 bg-[var(--warning)]/10 text-[var(--warning)]",
  RARE: "border-[var(--accent)]/40 bg-[var(--accent)]/15 text-[var(--accent-bright)]",
}

interface WordRarityChipProps {
  tier: WordRarityTier
}

export function WordRarityChip({ tier }: WordRarityChipProps) {
  return (
    <span
      className={`inline-flex rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${TIER_CLASS[tier]}`}
    >
      {tier}
    </span>
  )
}
