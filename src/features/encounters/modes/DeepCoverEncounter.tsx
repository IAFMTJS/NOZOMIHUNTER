"use client"

import type { QuestContract } from "@/contracts/quest-contract"
import { Panel } from "@/components/ui/Panel"
import { ModeEncounterShell } from "@/features/encounters/modes/ModeEncounterShell"
import { ConversationEncounter } from "@/features/conversation/components/ConversationEncounter"

interface DeepCoverEncounterProps {
  quest: QuestContract
  disabled?: boolean
  onSend: (message: string) => Promise<{
    passed: boolean
    encounterFailed: boolean
    feedback: string
  } | null>
  onAbandon: () => Promise<void>
  flashClassName?: string
}

export function DeepCoverEncounter(props: DeepCoverEncounterProps) {
  const trust = props.quest.conversationEncounter?.relationshipTrust ?? 50

  return (
    <ModeEncounterShell modeLabel="Deep Cover" emotion="Social pressure" quest={props.quest}>
      <Panel tone="inset" className="mb-3 !p-3">
        <p className="text-xs text-[var(--muted)]">
          Maintain cover identity — trust drops on wrong implication reads.
        </p>
        <div className="mt-2 space-y-1">
          <p className="text-[10px] uppercase tracking-widest text-[var(--muted)]">
            Cover trust
          </p>
          <div className="h-2 overflow-hidden rounded-full bg-[var(--surface-inset)]">
            <div
              className="h-full bg-[var(--accent-bright)] transition-all"
              style={{ width: `${Math.min(100, trust)}%` }}
            />
          </div>
        </div>
      </Panel>
      <ConversationEncounter {...props} />
    </ModeEncounterShell>
  )
}
