"use client"

import type { QuestContract } from "@/contracts/quest-contract"
import type { PlayerContract } from "@/contracts/player-contract"
import { Panel } from "@/components/ui/Panel"
import { ModeEncounterShell } from "@/features/encounters/modes/ModeEncounterShell"
import { VocabularyEncounter } from "@/features/quests/components/VocabularyEncounter"
import { computeEntityThreatIndex } from "@/systems/vocabulary/entityHuntSystem"

interface EntityHuntEncounterProps {
  quest: QuestContract
  player?: PlayerContract | null
  disabled?: boolean
  flashClassName?: string
  onSubmit: (answer: string) => Promise<void>
  onAbandon: () => Promise<void>
}

export function EntityHuntEncounter({
  quest,
  player,
  disabled,
  flashClassName,
  onSubmit,
  onAbandon,
}: EntityHuntEncounterProps) {
  const enc = quest.vocabularyEncounter
  const answered = enc?.currentIndex ?? 0
  const total = enc?.words?.length ?? 1
  const masteryProxy = Math.round((answered / Math.max(1, total)) * 100)
  const threatIndex = computeEntityThreatIndex(masteryProxy, "ELEVATED")

  return (
    <ModeEncounterShell modeLabel="Entity Hunt" emotion="Discovery" quest={quest}>
      <Panel tone="inset" className="mb-3 !p-3 nozomi-entity-network">
        <p className="text-xs text-[var(--muted)]">
          Track the anomaly — stabilize entities before threat index maxes out.
        </p>
        <div className="mt-2 space-y-1">
          <p className="text-[10px] uppercase tracking-widest text-[var(--danger)]">
            Threat index {threatIndex}%
          </p>
          <div className="h-2 overflow-hidden rounded-full bg-[var(--surface-inset)]">
            <div
              className="h-full bg-[var(--danger)] transition-all"
              style={{ width: `${threatIndex}%` }}
            />
          </div>
        </div>
      </Panel>
      <VocabularyEncounter
        quest={quest}
        player={player}
        disabled={disabled}
        flashClassName={flashClassName}
        onSubmit={onSubmit}
        onAbandon={onAbandon}
        hideLegacyBriefing
      />
    </ModeEncounterShell>
  )
}
