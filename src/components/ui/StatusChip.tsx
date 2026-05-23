type ChipTone = "neutral" | "accent" | "danger" | "warning" | "success"

interface StatusChipProps {
  label: string
  tone?: ChipTone
  pulse?: boolean
}

const TONE_CLASS: Record<ChipTone, string> = {
  neutral: "bg-white/10 text-[var(--muted)]",
  accent: "bg-[var(--accent)]/20 text-[var(--accent)]",
  danger: "bg-[var(--danger)]/20 text-[var(--danger)]",
  warning: "bg-[var(--warning)]/20 text-[var(--warning)]",
  success: "bg-[var(--success)]/20 text-[var(--success)]",
}

export function StatusChip({
  label,
  tone = "neutral",
  pulse = false,
}: StatusChipProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-[var(--radius-chip)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${TONE_CLASS[tone]}`}
    >
      {pulse && (
        <span
          className="h-1.5 w-1.5 animate-pulse rounded-full bg-current"
          aria-hidden
        />
      )}
      {label}
    </span>
  )
}
