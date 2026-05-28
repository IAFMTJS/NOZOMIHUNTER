"use client"

import { useEffect, useRef, useState } from "react"
import type { QuestContract } from "@/contracts/quest-contract"
import type { PlayerContract } from "@/contracts/player-contract"
import { getCurrentWord } from "@/systems/quests/vocabularyEncounterSystem"
import { pressureFeedbackLine } from "@/systems/learning/encounterPressureSystem"
import { eventBus } from "@/systems/events/eventBus"
import { GAME_EVENTS } from "@/systems/events/eventTypes"
import { resolveVocabularyThreat, threatDisplayLabel } from "@/systems/vocabulary/vocabularyThreatSystem"
import { getQuestBriefing } from "@/systems/quests/questGenerator"
import { VOCABULARY_ENCOUNTER_CONFIG } from "@/config/vocabularyEncounterConfig"
import {
  inputModeLabel,
  inputModePlaceholder,
} from "@/systems/learning/challengeDisplaySystem"
import { EncounterDisplayProvider } from "@/features/encounters/EncounterDisplayProvider"
import { EncounterHintProvider } from "@/features/encounters/context/EncounterHintContext"
import { EncounterHintControls } from "@/components/hints/EncounterHintControls"
import { buildHintWordContext } from "@/features/encounters/hintWordContext"
import {
  effectiveAssistLevel,
  resolveQuestGameMode,
} from "@/systems/gameModes/gameModeSystem"
import { EncounterRailWord } from "@/components/ui/EncounterRailWord"
import { LearnerWordLine } from "@/components/ui/LearnerWordLine"
import { learnerPartsFromEncounterWord } from "@/services/jmdict/learnerFormat"
import { Panel } from "@/components/ui/Panel"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { EncounterTargetRail } from "@/components/ui/EncounterTargetRail"
import { WordExtractionPanel } from "@/components/ui/screen/WordExtractionPanel"
import { ComboMeter } from "@/components/ceremonies/ComboMeter"
import { isComboMilestone } from "@/systems/learning/encounterPressureSystem"
import { E2E_TEST_IDS } from "@/config/e2eTestIds"

interface VocabularyEncounterProps {
  quest: QuestContract
  player?: PlayerContract | null
  disabled?: boolean
  onSubmit: (answer: string) => Promise<void>
  onAbandon: () => Promise<void>
  hideLegacyBriefing?: boolean
  flashClassName?: string
}

export function VocabularyEncounter({
  quest,
  player,
  disabled,
  onSubmit,
  onAbandon,
  hideLegacyBriefing = false,
  flashClassName = "",
}: VocabularyEncounterProps) {
  const [answer, setAnswer] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [localRevealId, setLocalRevealId] = useState<string | null>(null)
  const prevIndexRef = useRef(0)

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
  const pressureLine = encounter
    ? pressureFeedbackLine({
        correctStreak: encounter.correctStreak ?? 0,
        wrongAttempts: encounter.wrongAttempts,
      })
    : null

  useEffect(() => {
    if (!encounter) return
    if (encounter.currentIndex > prevIndexRef.current) {
      const revealed = encounter.words[prevIndexRef.current]
      if (revealed) {
        setLocalRevealId(revealed.id)
        eventBus.emit(GAME_EVENTS.CHALLENGE_REVEALED, {
          questId: quest.id,
          wordId: revealed.id,
        })
        const t = window.setTimeout(() => setLocalRevealId(null), 1400)
        prevIndexRef.current = encounter.currentIndex
        return () => window.clearTimeout(t)
      }
    }
    prevIndexRef.current = encounter.currentIndex
  }, [encounter?.currentIndex, encounter?.words, encounter, quest.id])

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

  const showingReveal = localRevealId != null
  const displayWord = showingReveal
    ? encounter?.words.find((w) => w.id === localRevealId) ?? word
    : word
  const phase = showingReveal ? ("REVEALED" as const) : ("ACTIVE" as const)
  const inputMode = word?.inputMode ?? "english"

  const streak = encounter?.correctStreak ?? 0
  const comboBurst = isComboMilestone(streak) ? " nozomi-combo-burst" : ""
  const wrongGlitch = flashClassName.includes("danger") ? " nozomi-encounter-glitch" : ""

  const body = (
    <Panel tone="inset" className={`mt-3 ${flashClassName}${comboBurst}${wrongGlitch}`}>
      {briefing && !hideLegacyBriefing && (
        <p className="mb-3 text-sm italic text-[var(--muted)]">{briefing}</p>
      )}

      <WordExtractionPanel
        words={encounter.words.map((w) => ({
          id: w.id,
          japanese: w.japanese,
          reading: w.reading,
          romaji: w.romaji,
          meaning: w.meanings[0] ?? "",
        }))}
        currentIndex={encounter.currentIndex}
      />

      <ComboMeter streak={streak} className="mb-2" />

      <EncounterTargetRail
        items={encounter.words.map((w, i) => {
          const done = i < encounter.currentIndex
          const current = i === encounter.currentIndex
          return {
            id: w.id,
            state: done ? "done" : current ? "current" : "hidden",
            content: (
              <EncounterRailWord
                japanese={w.japanese}
                reading={w.reading}
                romaji={w.romaji}
                meanings={w.meanings}
                slotState={done ? "done" : current ? "current" : "pending"}
                index={i}
              />
            ),
          }
        })}
      />

      {displayWord && word ? (
        <>
          <p className="mb-1 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
            Target lock {encounter.currentIndex + 1} / {encounter.words.length}
            {(encounter.correctStreak ?? 0) >= 3 && (
              <span className="ml-2 text-[var(--reward)]">· STABLE</span>
            )}
          </p>
          <p className="mb-3 text-[10px] uppercase tracking-wider text-[var(--warning)]">
            THREAT · {threatDisplayLabel(resolveVocabularyThreat(displayWord.id))}
          </p>
          {pressureLine && (
            <p className="mb-3 text-xs italic text-[var(--accent-bright)]">{pressureLine}</p>
          )}
          <div className="nozomi-hint-target mb-6 rounded-lg border border-[var(--border-accent)] bg-[var(--accent-dim)] px-4 py-6 text-center">
            <LearnerWordLine
              parts={learnerPartsFromEncounterWord({
                japanese: displayWord.japanese,
                reading: displayWord.reading,
                romaji: displayWord.romaji,
                meanings: displayWord.meanings,
              })}
              layout="stacked"
              size="lg"
              audio={phase === "REVEALED"}
              className="justify-center"
              forceReveal={phase === "REVEALED"}
            />
          </div>
          {!showingReveal && (
            <EncounterHintControls className="mb-4" />
          )}
          {!showingReveal && (
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <Input
                label={inputModeLabel(inputMode)}
                type="text"
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                disabled={disabled || submitting}
                placeholder={inputModePlaceholder(inputMode)}
                autoComplete="off"
              />
              <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <Button
                  type="submit"
                  size="md"
                  disabled={disabled || submitting || !answer.trim()}
                  className="w-full sm:w-auto"
                  data-testid={E2E_TEST_IDS.encounterTransmit}
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
          )}
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

  if (!word) return body

  const gameMode = resolveQuestGameMode(quest)
  const assistLevel = player
    ? effectiveAssistLevel(player, gameMode)
    : "FULL"
  const hintContext = buildHintWordContext({
    wordId: word.id,
    japanese: word.japanese,
    reading: word.reading,
    romaji: word.romaji,
    meanings: word.meanings,
    promptDirection: word.promptDirection ?? "RETRIEVE_ENGLISH",
    wrongAttempts: encounter.wrongAttempts,
  })

  return (
    <EncounterDisplayProvider
      quest={quest}
      player={player}
      promptDirection={word.promptDirection ?? "RETRIEVE_ENGLISH"}
      inputMode={word.inputMode ?? inputMode}
      phase={phase}
    >
      <EncounterHintProvider
        questId={quest.id}
        wordContext={hintContext}
        assistLevel={assistLevel}
        wrongAttempts={encounter.wrongAttempts}
        phase={phase}
      >
        {body}
      </EncounterHintProvider>
    </EncounterDisplayProvider>
  )
}
