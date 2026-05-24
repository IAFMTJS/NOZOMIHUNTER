"use client"

import { useState } from "react"
import type { QuestContract } from "@/contracts/quest-contract"
import { getCurrentWord } from "@/systems/quests/vocabularyEncounterSystem"
import { resolveVocabularyThreat, threatDisplayLabel } from "@/systems/vocabulary/vocabularyThreatSystem"
import { getQuestBriefing } from "@/systems/quests/questGenerator"
import { VOCABULARY_ENCOUNTER_CONFIG } from "@/config/vocabularyEncounterConfig"
import { JapaneseText } from "@/components/JapaneseText"
import { Panel } from "@/components/ui/Panel"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { EncounterTargetRail } from "@/components/ui/EncounterTargetRail"

interface VocabularyEncounterProps {
  quest: QuestContract
  disabled?: boolean
  onSubmit: (answer: string) => Promise<void>
  onAbandon: () => Promise<void>
  hideLegacyBriefing?: boolean
  flashClassName?: string
}

export function VocabularyEncounter({
  quest,
  disabled,
  onSubmit,
  onAbandon,
  hideLegacyBriefing = false,
  flashClassName = "",
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
    <Panel tone="inset" className={`mt-3 ${flashClassName}`}>
      {briefing && !hideLegacyBriefing && (
        <p className="mb-3 text-sm italic text-[var(--muted)]">{briefing}</p>
      )}

      <EncounterTargetRail
        items={encounter.words.map((w, i) => {
          const done = i < encounter.currentIndex
          const current = i === encounter.currentIndex
          return {
            id: w.id,
            state: done ? "done" : current ? "current" : "hidden",
            content: (
              <JapaneseText
                japanese={w.japanese}
                reading={w.reading}
                romaji={w.romaji}
                size="sm"
              />
            ),
          }
        })}
      />

      {word ? (
        <>
          <p className="mb-1 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
            Target lock {encounter.currentIndex + 1} / {encounter.words.length}
          </p>
          <p className="mb-3 text-[10px] uppercase tracking-wider text-[var(--warning)]">
            THREAT · {threatDisplayLabel(resolveVocabularyThreat(word.id))}
          </p>
          <div className="mb-6 rounded-lg border border-[var(--border-accent)] bg-[var(--accent-dim)] px-4 py-6 text-center">
            <JapaneseText
              japanese={word.japanese}
              reading={word.reading}
              romaji={word.romaji}
              size="lg"
            />
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <Input
              label="Transmit answer (romaji or English)"
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              disabled={disabled || submitting}
              placeholder="e.g. mizu or water"
              autoComplete="off"
            />
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <Button
                type="submit"
                size="md"
                disabled={disabled || submitting || !answer.trim()}
                className="w-full sm:w-auto"
              >
                {submitting ? "Transmitting…" : "Transmit"}
              </Button>
              <Button
                variant="ghost"
                size="md"
                disabled={disabled || submitting}
                onClick={onAbandon}
                className="w-full sm:w-auto"
              >
                Abort contract
              </Button>
            </div>
          </form>
          {objective && (
            <p className="mt-3 text-sm text-[var(--muted)]">
              Cleared: {objective.currentProgress}/{objective.requiredProgress}
              · Signal errors remaining: {wrongLeft}
            </p>
          )}
        </>
      ) : (
        <p className="text-sm text-[var(--accent-bright)]">
          All targets locked. Complete the contract to claim XP.
        </p>
      )}
    </Panel>
  )
}
