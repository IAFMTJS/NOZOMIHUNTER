"use client"

import { useEffect, useRef, useState } from "react"
import type { QuestContract } from "@/contracts/quest-contract"
import { ModeEncounterShell } from "@/features/encounters/modes/ModeEncounterShell"
import { Button } from "@/components/ui/Button"
import { memoryGridTimeExpired } from "@/systems/training/memoryGridSystem"

interface MemoryGridEncounterProps {
  quest: QuestContract
  disabled?: boolean
  onFlip: (cardId: string) => Promise<void>
  onAbandon: () => Promise<void>
}

export function MemoryGridEncounter({
  quest,
  disabled,
  onFlip,
  onAbandon,
}: MemoryGridEncounterProps) {
  const round = quest.memoryGridEncounter
  const startedAt = useRef(Date.now())
  const [timeLeft, setTimeLeft] = useState(round?.timeLimitSec ?? 90)

  useEffect(() => {
    if (!round) return
    startedAt.current = Date.now()
    const id = window.setInterval(() => {
      const elapsed = Date.now() - startedAt.current
      setTimeLeft(Math.max(0, round.timeLimitSec - Math.floor(elapsed / 1000)))
      if (memoryGridTimeExpired(round, startedAt.current)) {
        void onAbandon()
      }
    }, 500)
    return () => window.clearInterval(id)
  }, [round, onAbandon])

  if (!round) {
    return <p className="text-sm text-[var(--danger)]">Memory grid offline.</p>
  }

  const visible = (id: string) =>
    round.flippedIds.includes(id) ||
    round.matchedPairIds.includes(
      round.cards.find((c) => c.id === id)?.pairId ?? ""
    )

  return (
    <ModeEncounterShell modeLabel="Memory Grid" emotion="Dopamine" quest={quest}>
      <p className="mb-2 text-xs text-[var(--muted)]">
        Match pairs under time pressure — {timeLeft}s remaining · moves {round.moves}
      </p>
      <div className="nozomi-memory-grid grid grid-cols-2 gap-2 sm:grid-cols-4">
        {round.cards.map((card) => (
          <Button
            key={card.id}
            variant="ghost"
            disabled={disabled || visible(card.id)}
            className={`min-h-[3.5rem] justify-center text-center text-sm ${
              round.matchedPairIds.includes(card.pairId)
                ? "border-[var(--reward)]/50 opacity-80"
                : ""
            }`}
            onClick={() => void onFlip(card.id)}
          >
            {visible(card.id) ? (
              <span>
                <span className="block font-display">{card.face}</span>
                {card.reading && (
                  <span className="text-[10px] text-[var(--muted)]">{card.reading}</span>
                )}
              </span>
            ) : (
              "?"
            )}
          </Button>
        ))}
      </div>
      <Button variant="ghost" disabled={disabled} className="mt-3" onClick={() => void onAbandon()}>
        Abort drill
      </Button>
    </ModeEncounterShell>
  )
}
