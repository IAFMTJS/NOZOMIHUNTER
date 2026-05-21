import type { PlayerPenaltyContract } from "@/contracts/player-contract"

interface PenaltyStatusProps {
  penalties: PlayerPenaltyContract
}

export function PenaltyStatus({ penalties }: PenaltyStatusProps) {
  const { corruption, fatigue, xpDebt } = penalties
  if (corruption === 0 && fatigue === 0 && xpDebt === 0) return null

  return (
    <section
      className="mb-6 rounded border border-white/10 bg-white/5 p-4 text-sm"
      aria-label="Active penalties"
    >
      <h2 className="mb-2 text-xs uppercase tracking-wide text-[var(--muted)]">
        System Strain
      </h2>
      <ul className="flex flex-wrap gap-4 text-[var(--muted)]">
        {corruption > 0 && <li>Corruption {corruption}</li>}
        {fatigue > 0 && <li>Fatigue {fatigue}</li>}
        {xpDebt > 0 && <li>XP Debt {xpDebt}</li>}
      </ul>
    </section>
  )
}
