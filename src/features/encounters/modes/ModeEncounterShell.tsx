"use client"

import type { QuestContract } from "@/contracts/quest-contract"
import { Panel } from "@/components/ui/Panel"
import { StatusChip } from "@/components/ui/StatusChip"
import { ArcadeSessionHud } from "@/components/encounters/ArcadeSessionHud"
import { buildArcadeSessionHud } from "@/systems/presentation/arcadeSessionPresentationSystem"
import { isTrainingQuest } from "@/systems/training/trainingMissionSystem"

export function ModeEncounterShell({
  modeLabel,
  emotion,
  quest,
  children,
}: {
  modeLabel: string
  emotion: string
  quest?: QuestContract
  children: React.ReactNode
}) {
  const arcadeHud = quest && isTrainingQuest(quest) ? buildArcadeSessionHud(quest) : null

  return (
    <div className="nozomi-mode-encounter space-y-2">
      <Panel tone="accent" className="!px-3 !py-2">
        <ModeHeader modeLabel={modeLabel} emotion={emotion} />
      </Panel>
      {arcadeHud && <ArcadeSessionHud view={arcadeHud} />}
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
