import Link from "next/link"
import type { HunterPowerBreakdown } from "@/systems/power/hunterPowerSystem"

interface HunterPowerSummaryProps {
  power: HunterPowerBreakdown
  className?: string
}

export function HunterPowerSummary({ power, className = "" }: HunterPowerSummaryProps) {
  return (
    <Link
      href="/stats"
      className={`nozomi-embedded block rounded-xl border border-[var(--border-subtle)] p-4 transition-colors hover:border-[var(--accent)]/40 ${className}`.trim()}
    >
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="font-display text-xs uppercase tracking-widest text-[var(--muted)]">
            Hunter power
          </p>
          <p className="mt-1 font-mono text-3xl font-semibold tabular-nums text-[var(--reward)]">
            {power.total.toLocaleString()}
          </p>
        </div>
        <span className="text-xs text-[var(--accent-bright)]">Core stats →</span>
      </div>
      <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
        <li className="flex justify-between">
          <span className="text-[var(--muted)]">Attack</span>
          <span className="tabular-nums font-medium">{power.attack}</span>
        </li>
        <li className="flex justify-between">
          <span className="text-[var(--muted)]">Defense</span>
          <span className="tabular-nums font-medium">{power.defense}</span>
        </li>
        <li className="flex justify-between">
          <span className="text-[var(--muted)]">Crit rate</span>
          <span className="tabular-nums font-medium">{power.critRate}%</span>
        </li>
        <li className="flex justify-between">
          <span className="text-[var(--muted)]">Crit damage</span>
          <span className="tabular-nums font-medium">{power.critDamage}%</span>
        </li>
      </ul>
    </Link>
  )
}
