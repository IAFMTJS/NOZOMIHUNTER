"use client"

import type { QuestContract } from "@/contracts/quest-contract"
import { Panel } from "@/components/ui/Panel"
import { Button } from "@/components/ui/Button"
import { JapaneseText } from "@/components/JapaneseText"
import { ModeEncounterShell } from "@/features/encounters/modes/ModeEncounterShell"
import { ContractProgressRail } from "@/components/encounters/ContractProgressRail"
import {
  buildContractProgressView,
  shouldShowContractProgress,
} from "@/systems/presentation/contractProgressPresentationSystem"

interface TerminalBreachEncounterProps {
  quest: QuestContract
  disabled?: boolean
  onInterpret: (signId: string) => Promise<void>
  onAbandon: () => Promise<void>
}

export function TerminalBreachEncounter({
  quest,
  disabled,
  onInterpret,
  onAbandon,
}: TerminalBreachEncounterProps) {
  const breach = quest.terminalBreachEncounter
  if (!breach) {
    return <p className="text-sm text-[var(--danger)]">Sector data unavailable.</p>
  }

  const items = [...breach.signs, ...breach.terminals]
  const alarmEscalated = breach.alarmsTriggered >= 2
  const progressView = shouldShowContractProgress(quest)
    ? buildContractProgressView(quest)
    : null

  return (
    <ModeEncounterShell modeLabel="Terminal Breach" emotion="Curiosity" quest={quest}>
      <Panel
        tone="inset"
        className={`space-y-3 !p-4 ${alarmEscalated ? "nozomi-corruption-stage-3 nozomi-vfx-scanlines" : ""}`}
      >
        {progressView && <ContractProgressRail view={progressView} />}
        <p className="text-xs text-[var(--muted)]">
          Read sector signage and terminals. Wrong interpretation triggers alarms.
        </p>
        <p className="text-[10px] uppercase tracking-widest text-[var(--muted)]">
          Alarms: {breach.alarmsTriggered} · Step {breach.currentStep}/{breach.signs.length}
        </p>
        <div className="grid gap-2">
          {items.map((sign) => (
            <Button
              key={sign.id}
              variant="ghost"
              disabled={disabled}
              className="flex h-auto flex-col items-start gap-1 !py-3 text-left"
              onClick={() => void onInterpret(sign.id)}
            >
              <span className="text-[10px] uppercase text-[var(--muted)]">
                {sign.label}
              </span>
              <JapaneseText
                japanese={sign.japanese}
                reading={sign.reading}
                romaji={sign.romaji}
              />
            </Button>
          ))}
        </div>
        {breach.pathUnlocked && (
          <p className="text-xs text-[var(--success)]">Path unlocked — proceed to extraction.</p>
        )}
        <Button variant="ghost" disabled={disabled} onClick={() => void onAbandon()}>
          Abort infiltration
        </Button>
      </Panel>
    </ModeEncounterShell>
  )
}
