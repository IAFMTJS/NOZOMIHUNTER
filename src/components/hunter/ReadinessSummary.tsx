import type { ReadinessResultContract } from "@/contracts/readiness-contract"
import { PreparationScoreBar } from "@/components/preparation/PreparationScoreBar"

interface ReadinessSummaryProps {
  readiness: ReadinessResultContract
}

export function ReadinessSummary({ readiness }: ReadinessSummaryProps) {
  return (
    <div className="space-y-2">
      <PreparationScoreBar
        score={readiness.preparationScore}
        label="Operational readiness"
      />
      <p className="text-xs text-[var(--muted)]">{readiness.survivalLabel}</p>
    </div>
  )
}
