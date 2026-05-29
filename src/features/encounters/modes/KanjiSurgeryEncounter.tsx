"use client"

import type { QuestContract } from "@/contracts/quest-contract"
import { Panel } from "@/components/ui/Panel"
import { Button } from "@/components/ui/Button"
import { JapaneseText } from "@/components/JapaneseText"
import { ModeEncounterShell } from "@/features/encounters/modes/ModeEncounterShell"
import { isKanjiSurgeryComplete } from "@/systems/training/kanjiSurgerySystem"

interface KanjiSurgeryEncounterProps {
  quest: QuestContract
  disabled?: boolean
  onStabilize: (targetId: string, success: boolean) => Promise<void>
  onAbandon: () => Promise<void>
}

export function KanjiSurgeryEncounter({
  quest,
  disabled,
  onStabilize,
  onAbandon,
}: KanjiSurgeryEncounterProps) {
  const targets = quest.kanjiSurgeryEncounter ?? []
  const current = targets.find((t) => t.stability < 100) ?? targets[0]
  const complete = isKanjiSurgeryComplete(targets)

  if (!current) {
    return <p className="text-sm text-[var(--danger)]">No kanji seals loaded.</p>
  }

  return (
    <ModeEncounterShell modeLabel="Kanji Surgery" emotion="Discipline" quest={quest}>
      <Panel tone="inset" className="space-y-3 !p-4">
        <p className="text-xs text-[var(--muted)]">
          Trace and stabilize unstable kanji seals before corruption leaks.
        </p>
        <div className="text-center">
          <JapaneseText
            japanese={current.japanese}
            reading={current.reading}
            romaji={current.romaji}
            size="lg"
          />
          <p className="mt-2 text-xs text-[var(--muted)]">
            Stability {current.stability}%
          </p>
          <StabilityBar stability={current.stability} />
        </div>
        <div className="flex gap-2">
          <Button
            disabled={disabled || complete}
            onClick={() => void onStabilize(current.id, true)}
          >
            Stabilize seal
          </Button>
          <Button variant="ghost" disabled={disabled} onClick={() => void onAbandon()}>
            Abort
          </Button>
        </div>
      </Panel>
    </ModeEncounterShell>
  )
}

function StabilityBar({ stability }: { stability: number }) {
  return (
    <div className="mx-auto mt-2 h-1.5 w-full max-w-xs overflow-hidden rounded-full bg-[var(--panel-inset)]">
      <div
        className="h-full bg-[var(--accent)] transition-all"
        style={{ width: `${stability}%` }}
      />
    </div>
  )
}
