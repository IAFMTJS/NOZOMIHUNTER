import type { ReadinessResultContract } from "@/contracts/readiness-contract"
import { MIN_OPERATIONAL_READINESS_SCORE } from "@/systems/readiness/deployGateSystem"

interface PreparationScoreBreakdownProps {
  readiness: ReadinessResultContract
  baseLabel: string
  baseScore: number
}

function formatImpact(impact: number): string {
  const sign = impact >= 0 ? "+" : ""
  return `${sign}${Math.round(impact)}%`
}

export function PreparationScoreBreakdown({
  readiness,
  baseLabel,
  baseScore,
}: PreparationScoreBreakdownProps) {
  const rows = [
    { label: baseLabel, impact: baseScore, isBase: true },
    ...readiness.factors.map((f) => ({
      label: f.label,
      impact: f.impact,
      isBase: false,
    })),
  ]

  return (
    <section
      id="readiness-breakdown"
      className="nozomi-embedded space-y-3 rounded-xl px-4 py-3"
      aria-label="Preparation score breakdown"
    >
      <div className="flex items-baseline justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-widest text-[var(--accent-bright)]">
          Readiness calculation
        </p>
        <p className="font-mono text-sm tabular-nums text-[var(--foreground)]">
          {readiness.preparationScore}%
        </p>
      </div>
      <ul className="space-y-1.5 text-sm">
        {rows.map((row) => (
          <li key={row.label} className="flex justify-between gap-3">
            <span className="text-[var(--muted)]">{row.label}</span>
            <span
              className={
                row.isBase
                  ? "font-mono tabular-nums text-[var(--foreground)]"
                  : row.impact >= 0
                    ? "font-mono tabular-nums text-[var(--success)]"
                    : "font-mono tabular-nums text-[var(--danger)]"
              }
            >
              {row.isBase ? `${Math.round(row.impact)}%` : formatImpact(row.impact)}
            </span>
          </li>
        ))}
      </ul>
      <p className="border-t border-[var(--border-subtle)] pt-2 text-xs text-[var(--muted)]">
        Minimum operational readiness:{" "}
        <span className="font-mono text-[var(--foreground)]">
          {MIN_OPERATIONAL_READINESS_SCORE}%
        </span>
        {" · "}
        Current band:{" "}
        <span className="text-[var(--foreground)]">{readiness.survivalBand}</span>
      </p>
    </section>
  )
}
