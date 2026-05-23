import type { SynchronizationContract } from "@/contracts/player-contract"
import { synchronizationLabel } from "@/systems/synchronization/synchronizationSystem"
import { StatusChip } from "@/components/ui/StatusChip"

interface SynchronizationStatusProps {
  synchronization: SynchronizationContract
}

export function SynchronizationStatus({
  synchronization,
}: SynchronizationStatusProps) {
  const tone =
    synchronization.status === "STABLE"
      ? "accent"
      : synchronization.status === "AT_RISK"
        ? "danger"
        : "neutral"

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <StatusChip
        label={`Sync ${synchronization.chainDays}d`}
        tone={tone}
        pulse={synchronization.atRisk}
      />
      <span className="text-[var(--muted)]">
        {synchronizationLabel(synchronization.status)}
      </span>
    </div>
  )
}
