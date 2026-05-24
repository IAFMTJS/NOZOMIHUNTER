"use client"

import type { QuestContract } from "@/contracts/quest-contract"
import { SpeechEncounter } from "@/features/speech/components/SpeechEncounter"
import { Panel } from "@/components/ui/Panel"
import { ModeEncounterShell } from "@/features/encounters/modes/ModeEncounterShell"

interface ShadowEchoEncounterProps {
  quest: QuestContract
  disabled?: boolean
  onSubmit: (
    transcript: string,
    responseTimeMs: number
  ) => Promise<void>
  onAbandon: () => Promise<void>
}

export function ShadowEchoEncounter(props: ShadowEchoEncounterProps) {
  return (
    <ModeEncounterShell modeLabel="Shadow Echo" emotion="Discipline">
      <Panel tone="inset" className="mb-3 !p-3">
        <p className="text-xs text-[var(--muted)]">
          Listen to the operator transmission, then mirror pacing and pronunciation.
        </p>
      </Panel>
      <SpeechEncounter {...props} hideLegacyBriefing />
    </ModeEncounterShell>
  )
}
