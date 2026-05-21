"use client"

import { useState } from "react"
import type { QuestContract } from "@/contracts/quest-contract"
import { getCurrentWord } from "@/systems/quests/vocabularyEncounterSystem"
import { getQuestBriefing } from "@/systems/quests/questGenerator"
import { VOCABULARY_ENCOUNTER_CONFIG } from "@/config/vocabularyEncounterConfig"
import { JapaneseText } from "@/components/JapaneseText"

interface VocabularyEncounterProps {
  quest: QuestContract
  disabled?: boolean
  onSubmit: (answer: string) => Promise<void>
  onAbandon: () => Promise<void>
}

export function VocabularyEncounter({
  quest,
  disabled,
  onSubmit,
  onAbandon,
}: VocabularyEncounterProps) {
  const [answer, setAnswer] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const encounter = quest.vocabularyEncounter
  const word = encounter ? getCurrentWord(encounter) : null
  const objective = quest.objectives[0]
  const briefing = getQuestBriefing(quest)
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

  if (!encounter?.words.length) {
    return (
      <p className="mt-3 text-sm text-[var(--danger)]">
        Encounter data missing. Refresh the page to reload your contract.
      </p>
    )
  }

  return (
    <div className="mt-3 rounded border border-white/10 bg-black/20 p-4">
      {briefing && (
        <p className="mb-3 text-sm italic text-[var(--muted)]">{briefing}</p>
      )}

      <div className="mb-4 flex flex-wrap gap-2">
        {encounter.words.map((w, i) => {
          const done = i < encounter.currentIndex
          const current = i === encounter.currentIndex
          const revealed = done || current
          return (
            <span
              key={w.id}
              className={`inline-flex flex-col rounded px-2 py-1 text-xs ${
                done
                  ? "bg-[var(--accent)]/20 text-[var(--accent)]"
                  : current
                    ? "border border-[var(--accent)] text-[var(--accent)]"
                    : "border border-white/10 text-[var(--muted)]"
              }`}
            >
              {revealed ? (
                <JapaneseText
                  japanese={w.japanese}
                  reading={w.reading}
                  romaji={w.romaji}
                  size="sm"
                />
              ) : (
                <span>？</span>
              )}
            </span>
          )
        })}
      </div>

      {word ? (
        <>
          <p className="mb-1 text-xs uppercase tracking-wide text-[var(--muted)]">
            Target {encounter.currentIndex + 1} / {encounter.words.length}
          </p>
          <div className="mb-4">
            <JapaneseText
              japanese={word.japanese}
              reading={word.reading}
              romaji={word.romaji}
              size="lg"
            />
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <label className="text-sm text-[var(--muted)]">
              Your answer (romaji or English)
              <input
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                disabled={disabled || submitting}
                className="mt-1 w-full rounded border border-white/20 bg-black/30 px-3 py-2 text-[var(--foreground)]"
                placeholder="e.g. mizu or water"
                autoComplete="off"
              />
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={disabled || submitting || !answer.trim()}
                className="rounded border border-[var(--accent)] px-3 py-1 text-sm text-[var(--accent)] hover:bg-[var(--accent)] hover:text-black disabled:opacity-50"
              >
                {submitting ? "Checking..." : "Submit"}
              </button>
              <button
                type="button"
                disabled={disabled || submitting}
                onClick={onAbandon}
                className="rounded border border-white/20 px-3 py-1 text-sm text-[var(--muted)] hover:bg-white/10 disabled:opacity-50"
              >
                Abandon
              </button>
            </div>
          </form>
          {objective && (
            <p className="mt-3 text-sm text-[var(--muted)]">
              Cleared: {objective.currentProgress}/{objective.requiredProgress}
              · Mistakes remaining: {wrongLeft}
            </p>
          )}
        </>
      ) : (
        <p className="text-sm text-[var(--muted)]">
          All targets identified. Complete the contract to claim XP.
        </p>
      )}
    </div>
  )
}
