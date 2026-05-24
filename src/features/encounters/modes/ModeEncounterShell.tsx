"use client"

import { Panel } from "@/components/ui/Panel"
import { StatusChip } from "@/components/ui/StatusChip"

export function ModeEncounterShell({
  modeLabel,
  emotion,
  children,
}: {
  modeLabel: string
  emotion: string
  children: React.ReactNode
}) {
  return (
    <div className="nozomi-mode-encounter space-y-2">
      <Panel tone="accent" className="!px-3 !py-2">
        <ModeHeader modeLabel={modeLabel} emotion={emotion} />
      </Panel>
      {children}
    </div>
  )
}

function ModeHeader({
  modeLabel,
  emotion,
}: {
  modeLabel: string
  emotion: string
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--foreground)]">
        {modeLabel}
      </p>
      <StatusChip label={emotion} tone="neutral" />
    </div>
  )
}
