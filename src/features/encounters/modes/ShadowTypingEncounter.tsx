"use client"

import { useEffect, useRef, useState } from "react"
import type { QuestContract } from "@/contracts/quest-contract"
import type { PlayerContract } from "@/contracts/player-contract"
import { VocabularyEncounter } from "@/features/quests/components/VocabularyEncounter"
import { ModeEncounterShell } from "@/features/encounters/modes/ModeEncounterShell"
import {
  SHADOW_TYPING_DECAY_MS,
  isShadowPromptExpired,
  shadowDecayPercent,
} from "@/systems/training/shadowTypingSystem"

interface ShadowTypingEncounterProps {
  quest: QuestContract
  player?: PlayerContract | null
  disabled?: boolean
  flashClassName?: string
  onSubmit: (answer: string) => Promise<void>
  onAbandon: () => Promise<void>
}

export function ShadowTypingEncounter({
  quest,
  player,
  disabled,
  flashClassName,
  onSubmit,
  onAbandon,
}: ShadowTypingEncounterProps) {
  const [elapsed, setElapsed] = useState(0)
  const indexRef = useRef(quest.vocabularyEncounter?.currentIndex ?? 0)

  useEffect(() => {
    const idx = quest.vocabularyEncounter?.currentIndex ?? 0
    if (idx !== indexRef.current) {
      indexRef.current = idx
      setElapsed(0)
    }
    const id = window.setInterval(() => {
      setElapsed((e) => e + 200)
    }, 200)
    return () => window.clearInterval(id)
  }, [quest.vocabularyEncounter?.currentIndex])

  const decay = shadowDecayPercent(elapsed)
  const expired = isShadowPromptExpired(elapsed)

  return (
    <ModeEncounterShell modeLabel="Shadow Typing" emotion="Anxiety" quest={quest}>
      <div className="mb-2 h-1 overflow-hidden rounded bg-[var(--overlay-panel)]">
        <div
          className="h-full bg-[var(--danger)] transition-all duration-200"
          style={{ width: `${decay}%` }}
        />
      </div>
      <p className="mb-2 text-xs text-[var(--muted)]">
        Words decay — transmit before the signal collapses ({Math.ceil(
          (SHADOW_TYPING_DECAY_MS - elapsed) / 1000
        )}s).
      </p>
      <div
        className="transition-opacity duration-200"
        style={{ opacity: Math.max(0.15, decay / 100) }}
      >
        <VocabularyEncounter
          quest={quest}
          player={player}
          disabled={disabled || expired}
          hideLegacyBriefing
          flashClassName={flashClassName}
          onSubmit={onSubmit}
          onAbandon={onAbandon}
        />
      </div>
    </ModeEncounterShell>
  )
}
