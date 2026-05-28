"use client"

import Link from "next/link"
import type { OperationalAlert } from "@/systems/home/operationalFeedSystem"
import { StatusChip } from "@/components/ui/StatusChip"

interface OperationalAlertRailProps {
  alerts: OperationalAlert[]
}

const TONE_MAP = {
  danger: "danger",
  warning: "warning",
  accent: "accent",
} as const

export function OperationalAlertRail({ alerts }: OperationalAlertRailProps) {
  if (!alerts.length) return null

  return (
    <div className="nozomi-embedded rounded-xl border border-[var(--danger)]/30 p-4">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--danger)]">
        Operational alerts
      </p>
      <ul className="space-y-2">
        {alerts.map((alert) => (
          <li key={alert.id} className="rounded-lg border border-[var(--border-subtle)] bg-[var(--overlay-faint)] p-3">
            <div className="mb-1 flex items-center gap-2">
              <StatusChip label={alert.headline} tone={TONE_MAP[alert.tone]} pulse />
            </div>
            <p className="text-xs text-[var(--muted)]">{alert.detail}</p>
            {alert.recoveryHref && (
              <Link
                href={alert.recoveryHref}
                className="mt-2 inline-block text-xs font-medium text-[var(--accent-bright)] hover:underline"
              >
                Open recovery route
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
