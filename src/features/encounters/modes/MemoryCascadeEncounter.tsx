"use client"

import { useEffect, useMemo, useState } from "react"
import type { QuestContract } from "@/contracts/quest-contract"
import { Panel } from "@/components/ui/Panel"
import { Button } from "@/components/ui/Button"
import { LearnerWordLine } from "@/components/ui/LearnerWordLine"
import { learnerPartsFromEncounterWord } from "@/services/jmdict/learnerFormat"
import { ModeEncounterShell } from "@/features/encounters/modes/ModeEncounterShell"

interface MemoryCascadeEncounterProps {
  quest: QuestContract
  disabled?: boolean
  onIdentifyIntruder: (wordId: string) => Promise<void>
  onAbandon: () => Promise<void>
}

export function MemoryCascadeEncounter({
  quest,
  disabled,
  onIdentifyIntruder,
  onAbandon,
}: MemoryCascadeEncounterProps) {
  const round = quest.memoryCascadeEncounter
  const [revealed, setRevealed] = useState(false)

  const wordSequenceKey = useMemo(
    () => round?.words.map((w) => w.id).join(",") ?? "",
    [round?.words]
  )

  useEffect(() => {
    if (!round) return
    setRevealed(true)
    const t = window.setTimeout(() => setRevealed(false), 2400)
    return () => window.clearTimeout(t)
  }, [round, wordSequenceKey])

  if (!round) {
    return <p className="text-sm text-[var(--danger)]">Memory cascade offline.</p>
  }

  return (
    <ModeEncounterShell modeLabel="Memory Cascade" emotion="Discipline" quest={quest}>
      <Panel tone="inset" className="space-y-3 !p-4">
        <p className="text-xs text-[var(--muted)]">
          Memorize the sequence — identify the intruder word when the ifades.
        </p>
        {revealed ? (
          <div className="grid gap-2">
            {round.words.map((w) => (
              <LearnerWordLine
                key={w.id}
                parts={learnerPartsFromEncounterWord(w)}
                layout="compact"
                size="sm"
                forceReveal={revealed}
              />
            ))}
          </div>
        ) : (
          <p className="text-center text-sm text-[var(--foreground)]">
            Which word was the intruder?
          </p>
        )}
        {!revealed && (
          <div className="nozomi-memory-grid grid grid-cols-2 gap-2">
            {[...round.words, ...(round.intruderId ? [{ id: round.intruderId }] : [])]
              .filter(
                (w, i, arr) => arr.findIndex((x) => x.id === w.id) === i
              )
              .map((w) => {
                const word = round.words.find((x) => x.id === w.id)
                if (!word) return null
                return (
                  <Button
                    key={w.id}
                    variant="ghost"
                    disabled={disabled}
                    className="justify-start"
                    onClick={() => void onIdentifyIntruder(w.id)}
                  >
                    {word.japanese} ({word.romaji})
                  </Button>
                )
              })}
          </div>
        )}
        <Button variant="ghost" disabled={disabled} onClick={() => void onAbandon()}>
          Abort drill
        </Button>
      </Panel>
    </ModeEncounterShell>
  )
}
