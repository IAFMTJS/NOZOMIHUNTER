"use client"

import type { AnomalyFeedItem } from "@/systems/home/operationalFeedSystem"
import { StatusChip } from "@/components/ui/StatusChip"

interface AnomalyChipProps {
  anomalies: AnomalyFeedItem[]
}

export function AnomalyChip({ anomalies }: AnomalyChipProps) {
  if (!anomalies.length) return null

  const primary = anomalies[0]!

  return (
    <div className="rounded-xl border border-[var(--warning)]/30 bg-[var(--warning)]/5 p-3">
      <div className="flex items-start gap-2">
        <StatusChip label="Anomaly" tone="warning" pulse />
        <div>
          <p className="text-sm text-[var(--foreground)]">{primary.label}</p>
          <p className="mt-0.5 text-xs text-[var(--muted)]">{primary.detail}</p>
          {anomalies.length > 1 && (
            <p className="mt-1 text-[10px] text-[var(--muted)]">
              +{anomalies.length - 1} additional signal{anomalies.length > 2 ? "s" : ""}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
