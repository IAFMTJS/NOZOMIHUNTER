"use client"

import { useEffect, useState } from "react"
import type { QuestContract } from "@/contracts/quest-contract"
import type { PlayerContract } from "@/contracts/player-contract"
import { SpeechEncounter } from "@/features/speech/components/SpeechEncounter"
import { Panel } from "@/components/ui/Panel"
import { ModeEncounterShell } from "@/features/encounters/modes/ModeEncounterShell"

const DECAY_SECONDS = 18

interface ShadowEchoEncounterProps {
  quest: QuestContract
  player?: PlayerContract | null
  disabled?: boolean
  onSubmit: (
    transcript: string,
    responseTimeMs: number
  ) => Promise<void>
  onAbandon: () => Promise<void>
}

export function ShadowEchoEncounter(props: ShadowEchoEncounterProps) {
  const [secondsLeft, setSecondsLeft] = useState(DECAY_SECONDS)

  useEffect(() => {
    setSecondsLeft(DECAY_SECONDS)
    const id = window.setInterval(() => {
      setSecondsLeft((s) => (s <= 0 ? DECAY_SECONDS : s - 1))
    }, 1000)
    return () => window.clearInterval(id)
  }, [props.quest.speechEncounter?.currentIndex])

  const urgent = secondsLeft <= 6

  return (
    <ModeEncounterShell modeLabel="Shadow Echo" emotion="Discipline">
      <Panel tone="inset" className="mb-3 !p-3">
        <p className="text-xs text-[var(--muted)]">
          Mirror the transmission before the echo decays — type while the signal holds.
        </p>
        <p
          className={`mt-2 font-mono text-sm tabular-nums ${
            urgent ? "text-[var(--danger)] nozomi-encounter-glitch" : "text-[var(--accent-bright)]"
          }`}
        >
          Signal decay: {secondsLeft}s
        </p>
      </Panel>
      <SpeechEncounter {...props} hideLegacyBriefing />
    </ModeEncounterShell>
  )
}
