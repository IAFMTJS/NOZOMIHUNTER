"use client"

import type { QuestContract } from "@/contracts/quest-contract"
import { ListeningEncounter } from "@/features/dungeons/components/ListeningEncounter"
import { Panel } from "@/components/ui/Panel"
import { StatusChip } from "@/components/ui/StatusChip"
import { ModeEncounterShell } from "@/features/encounters/modes/ModeEncounterShell"

interface SignalCalibrationEncounterProps {
  quest: QuestContract
  disabled?: boolean
  maxWrongAttempts?: number
  maxReplays?: number
  signalDegraded?: boolean
  onSubmit: (answer: string) => Promise<void>
  onAbandon: () => Promise<void>
  flashClassName?: string
}

export function SignalCalibrationEncounter(props: SignalCalibrationEncounterProps) {
  const budget = props.quest.listeningEncounter?.replayBudget ?? 5
  return (
    <ModeEncounterShell modeLabel="Signal Calibration" emotion="Discipline">
      <Panel tone="inset" className="mb-3 !p-3">
        <p className="text-xs text-[var(--muted)]">
          Isolate the primary channel. Reconstruct fragmented comms in order.
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <StatusChip
            label={
              props.quest.listeningEncounter?.channelIsolated
                ? "Channel locked"
                : "Scanning channels"
            }
            tone="accent"
          />
          <StatusChip label={`Replay budget ${budget}`} tone="neutral" />
        </div>
      </Panel>
      <ListeningEncounter {...props} maxReplays={budget} focusMode />
    </ModeEncounterShell>
  )
}
