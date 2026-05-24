"use client"

import { useState } from "react"
import type { QuestContract } from "@/contracts/quest-contract"
import { ListeningEncounter } from "@/features/dungeons/components/ListeningEncounter"
import { Panel } from "@/components/ui/Panel"
import { Button } from "@/components/ui/Button"
import { StatusChip } from "@/components/ui/StatusChip"
import { ModeEncounterShell } from "@/features/encounters/modes/ModeEncounterShell"

interface LostTransmissionEncounterProps {
  quest: QuestContract
  disabled?: boolean
  maxWrongAttempts?: number
  maxReplays?: number
  signalDegraded?: boolean
  onSubmit: (answer: string) => Promise<void>
  onAbandon: () => Promise<void>
  flashClassName?: string
}

export function LostTransmissionEncounter(props: LostTransmissionEncounterProps) {
  const keywords = props.quest.listeningEncounter?.timelineKeywords ?? []
  const tagged = props.quest.listeningEncounter?.taggedKeywords ?? []
  const [localTagged, setLocalTagged] = useState<string[]>(tagged)

  function tagKeyword(word: string) {
    setLocalTagged((prev) =>
      prev.includes(word) ? prev.filter((w) => w !== word) : [...prev, word]
    )
  }

  return (
    <ModeEncounterShell modeLabel="Lost Transmission" emotion="Curiosity">
      <Panel tone="inset" className="mb-3 !p-3">
        <p className="text-xs text-[var(--muted)]">
          Replay clips and tag keywords to reconstruct the event timeline.
        </p>
        {keywords.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {keywords.map((kw) => (
              <Button
                key={kw}
                type="button"
                variant={localTagged.includes(kw) ? "primary" : "ghost"}
                className="!px-2 !py-1 text-xs"
                onClick={() => tagKeyword(kw)}
              >
                {kw}
              </Button>
            ))}
          </div>
        )}
        <TimelineProgress count={localTagged.length} total={keywords.length} />
      </Panel>
      <ListeningEncounter {...props} maxReplays={props.quest.listeningEncounter?.replayBudget ?? 6} focusMode />
    </ModeEncounterShell>
  )
}

function TimelineProgress({ count, total }: { count: number; total: number }) {
  return (
    <div className="mt-2">
      <StatusChip label={`Timeline ${count}/${total} tagged`} tone="accent" />
    </div>
  )
}
