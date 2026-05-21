"use client"

import { useState } from "react"
import type { QuestContract } from "@/contracts/quest-contract"
import { getCurrentFragment } from "@/systems/dungeons/listeningEncounterSystem"
import { VOCABULARY_ENCOUNTER_CONFIG } from "@/config/vocabularyEncounterConfig"

interface ListeningEncounterProps {
  quest: QuestContract
  disabled?: boolean
  onSubmit: (answer: string) => Promise<void>
  onAbandon: () => Promise<void>
}

export function ListeningEncounter({
  quest,
  disabled,
  onSubmit,
  onAbandon,
}: ListeningEncounterProps) {
  const [answer, setAnswer] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const encounter = quest.listeningEncounter
  const fragment = encounter ? getCurrentFragment(encounter) : null
  const wrongLeft = encounter
    ? Math.max(
        0,
        VOCABULARY_ENCOUNTER_CONFIG.MAX_WRONG_ATTEMPTS - encounter.wrongAttempts
      )
    : 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!answer.trim() || submitting) return
    setSubmitting(true)
    try {
      await onSubmit(answer.trim())
      setAnswer("")
    } finally {
      setSubmitting(false)
    }
  }

  if (!encounter?.fragments.length || !fragment) {
    return (
      <p className="text-sm text-[var(--muted)]">Listening signal unavailable.</p>
    )
  }

  const hint = fragment.meanings[0] ?? "unknown"

  return (
    <div className="rounded border border-white/10 bg-black/30 p-4">
      <p className="mb-2 text-xs uppercase tracking-wide text-[var(--muted)]">
        Listening sector
      </p>
      <p className="mb-3 text-sm">{encounter.briefing}</p>
      <p className="mb-1 text-sm text-[var(--muted)]">
        Fragment {encounter.currentIndex + 1} / {encounter.fragments.length}
      </p>
      <p className="mb-4 text-lg font-semibold">
        Signal hint: <span className="text-[var(--accent)]">{hint}</span>
      </p>
      <p className="mb-3 text-xs text-[var(--muted)]">
        The glyph is hidden. Reply with romaji, kana, or another valid reading.
        · {wrongLeft} attempts remaining
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <input
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={disabled || submitting}
          placeholder="Decode transmission..."
          className="rounded border border-white/20 bg-black/40 px-3 py-2 text-sm"
          autoComplete="off"
        />
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={disabled || submitting || !answer.trim()}
            className="rounded border border-[var(--accent)] px-3 py-1 text-sm text-[var(--accent)] hover:bg-[var(--accent)] hover:text-black disabled:opacity-50"
          >
            Transmit
          </button>
          <button
            type="button"
            disabled={disabled || submitting}
            onClick={() => onAbandon()}
            className="text-sm text-[var(--danger)] hover:underline disabled:opacity-50"
          >
            Abort sector
          </button>
        </div>
      </form>
    </div>
  )
}
