"use client"

import { useState } from "react"
import type { QuestContract } from "@/contracts/quest-contract"
import { ModeEncounterShell } from "@/features/encounters/modes/ModeEncounterShell"
import { Button } from "@/components/ui/Button"
import { useJapaneseTts } from "@/hooks/useJapaneseTts"
import { stopJapaneseSpeech } from "@/systems/listening/japaneseTtsSystem"

interface EchoListeningEncounterProps {
  quest: QuestContract
  disabled?: boolean
  onHeard: () => Promise<void>
  onSelectChunk: (chunkId: string) => Promise<void>
  onSubmit: () => Promise<void>
  onAbandon: () => Promise<void>
}

export function EchoListeningEncounter({
  quest,
  disabled,
  onHeard,
  onSelectChunk,
  onSubmit,
  onAbandon,
}: EchoListeningEncounterProps) {
  const round = quest.echoListeningEncounter
  const tts = useJapaneseTts()
  const [played, setPlayed] = useState(false)

  if (!round) {
    return <p className="text-sm text-[var(--danger)]">Echo channel offline.</p>
  }

  async function playOnce() {
    if (!round || played || disabled) return
    setPlayed(true)
    await tts.play(round.fragment.japanese, round.fragment.reading)
    await onHeard()
    stopJapaneseSpeech()
  }

  const shuffled = round.chunks
  const pool = shuffled.filter((c) => !round.selectedIds.includes(c.id))
  const built = round.selectedIds
    .map((id) => round.chunks.find((c) => c.id === id))
    .filter(Boolean)

  return (
    <ModeEncounterShell modeLabel="Echo Listening" emotion="Discipline" quest={quest}>
      <p className="mb-2 text-xs text-[var(--warning)]">
        One playback only — tap phrase tiles in correct order.
      </p>
      <Button
        variant="cta"
        disabled={disabled || played}
        className="mb-3 w-full"
        onClick={() => void playOnce()}
      >
        {played ? "Signal captured" : "Play transmission (1×)"}
      </Button>
      {built.length > 0 && (
        <p className="mb-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--overlay-panel-strong)] px-3 py-2 font-mono text-sm text-[var(--foreground)]">
          {built.map((c) => c!.label).join(" ")}
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {pool.map((chunk) => (
          <Button
            key={chunk.id}
            variant="ghost"
            disabled={disabled || !round.heardOnce}
            onClick={() => void onSelectChunk(chunk.id)}
          >
            {chunk.label}
          </Button>
        ))}
      </div>
      {round.selectedIds.length > 0 && (
        <div className="mt-3 flex gap-2">
          <Button
            variant="cta"
            disabled={disabled || round.selectedIds.length !== round.chunks.length}
            className="flex-1"
            onClick={() => void onSubmit()}
          >
            Transmit reconstruction
          </Button>
          <Button variant="ghost" disabled={disabled} onClick={() => void onAbandon()}>
            Abort
          </Button>
        </div>
      )}
    </ModeEncounterShell>
  )
}
