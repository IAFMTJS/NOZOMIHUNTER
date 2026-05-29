import type { ProximityChipContract } from "@/systems/progression/almostThereSystem"

interface ProgressProximityRailProps {
  chips: ProximityChipContract[]
}

const toneClass: Record<ProximityChipContract["tone"], string> = {
  accent: "border-[var(--accent)]/40 text-[var(--accent-bright)]",
  danger: "border-[var(--danger)]/40 text-[var(--danger)]",
  reward: "border-[var(--reward)]/40 text-[var(--reward)]",
  muted: "border-[var(--border-subtle)] text-[var(--muted)]",
}

export function ProgressProximityRail({ chips }: ProgressProximityRailProps) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {chips.map((chip) => (
        <div
          key={chip.id}
          className={`rounded-lg border bg-[var(--overlay-subtle)] p-3 ${toneClass[chip.tone]}`}
        >
          <p className="text-[10px] uppercase tracking-wider opacity-80">{chip.label}</p>
          <p className="mt-1 font-mono text-lg font-semibold tabular-nums text-[var(--foreground)]">
            {chip.value}
          </p>
          <p className="mt-0.5 text-[10px] leading-snug text-[var(--muted)]">{chip.subline}</p>
        </div>
      ))}
    </div>
  )
}
