import type { PlayerPenaltyContract } from "@/contracts/player-contract"
import { Panel } from "@/components/ui/Panel"
import {
  CORRUPTION_HIGH_THRESHOLD,
  CORRUPTION_UI_THRESHOLD,
} from "@/systems/presentation/penaltyPresentationSystem"

interface PenaltyStatusProps {
  penalties: PlayerPenaltyContract
  className?: string
}

function PenaltyMeter({
  label,
  value,
  max = 100,
  colorVar,
}: {
  label: string
  value: number
  max?: number
  colorVar: string
}) {
  const pct = Math.min(100, (value / max) * 100)
  return (
    <li className="min-w-[8rem] flex-1">
      <div className="mb-1 flex justify-between text-xs uppercase tracking-wide text-[var(--muted)]">
        <span>{label}</span>
        <span className="tabular-nums">{value}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-[var(--overlay-panel)]">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{
            width: `${pct}%`,
            backgroundColor: `var(${colorVar})`,
          }}
        />
      </div>
    </li>
  )
}

export function PenaltyStatus({ penalties, className = "" }: PenaltyStatusProps) {
  const { corruption, fatigue, xpDebt } = penalties
  if (corruption === 0 && fatigue === 0 && xpDebt === 0) return null

  const panelTone =
    corruption >= CORRUPTION_HIGH_THRESHOLD
      ? "corruption"
      : corruption >= CORRUPTION_UI_THRESHOLD
        ? "danger"
        : "inset"

  return (
    <Panel
      as="section"
      tone={panelTone}
      className={className}
      aria-label="Active penalties"
    >
      <h2 className="mb-3 font-display text-xs uppercase tracking-[0.2em] text-[var(--danger)]">
        System strain
      </h2>
      <ul className="flex flex-col gap-4">
        {corruption > 0 && (
          <PenaltyMeter
            label="Corruption"
            value={corruption}
            colorVar="--corruption"
          />
        )}
        {fatigue > 0 && (
          <PenaltyMeter label="Fatigue" value={fatigue} colorVar="--warning" />
        )}
        {xpDebt > 0 && (
          <PenaltyMeter label="XP debt" value={xpDebt} colorVar="--danger" />
        )}
      </ul>
    </Panel>
  )
}
