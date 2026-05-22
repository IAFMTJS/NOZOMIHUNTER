"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import type { QuestContract } from "@/contracts/quest-contract"
import { PreparationScoreBar } from "@/components/preparation/PreparationScoreBar"
import { Panel } from "@/components/ui/Panel"
import { Button } from "@/components/ui/Button"
import { StatusChip } from "@/components/ui/StatusChip"
import { VocabularyEncounter } from "./VocabularyEncounter"
import { ConversationEncounter } from "@/features/conversation/components/ConversationEncounter"
import { SpeechEncounter } from "@/features/speech/components/SpeechEncounter"
import { ListeningEncounter } from "@/features/dungeons/components/ListeningEncounter"
import { QuestPreparationGate } from "./QuestPreparationGate"
import { hasActivePreparationPhase } from "@/systems/vocabulary/vocabularyPreparationOrchestrator"
import { EncounterFocusShell } from "@/components/ui/EncounterFocusShell"
import { QuestContractActions } from "./QuestContractActions"
import {
  EncounterFeedback,
  feedbackToneFromMessage,
} from "@/components/ui/EncounterFeedback"
import { MOTION } from "@/config/motionPresets"

interface QuestCardProps {
  quest: QuestContract
  onProgress: () => void
  onComplete: () => void
  onSubmitAnswer?: (answer: string) => Promise<{
    correct: boolean
    encounterFailed: boolean
  } | null>
  onSendMessage?: (message: string) => Promise<{
    passed: boolean
    encounterFailed: boolean
    feedback: string
  } | null>
  onSubmitSpeech?: (
    transcript: string,
    responseTimeMs: number
  ) => Promise<{
    passed: boolean
    encounterFailed: boolean
    feedback: string
    compositeScore: number
  } | null>
  onSubmitListening?: (answer: string) => Promise<{
    correct: boolean
    encounterFailed: boolean
  } | null>
  onAbandon?: () => Promise<void>
  onDismissPreparation?: (questId: string) => void | Promise<void>
  disabled?: boolean
  encounterClassName?: string
  maxWrongAttempts?: number
  maxListeningReplays?: number
  signalDegraded?: boolean
}

export function QuestCard({
  quest,
  onProgress,
  onComplete,
  onSubmitAnswer,
  onSendMessage,
  onSubmitSpeech,
  onSubmitListening,
  onAbandon,
  onDismissPreparation,
  disabled,
  encounterClassName = "",
  maxWrongAttempts,
  maxListeningReplays,
  signalDegraded,
}: QuestCardProps) {
  const [lastResult, setLastResult] = useState<string | null>(null)
  const [flash, setFlash] = useState<"success" | "danger" | null>(null)

  const objective = quest.objectives[0]
  const canComplete =
    objective &&
    objective.currentProgress >= objective.requiredProgress

  const hasWords = (quest.vocabularyEncounter?.words.length ?? 0) > 0
  const hasConversation = (quest.conversationEncounter?.messages.length ?? 0) > 0
  const isVocabularyEncounter = quest.type === "VOCABULARY" && hasWords
  const isConversationEncounter =
    quest.type === "CONVERSATION" && hasConversation
  const hasSpeech = (quest.speechEncounter?.phrases.length ?? 0) > 0
  const isSpeechEncounter = quest.type === "SPEECH" && hasSpeech
  const hasListening = (quest.listeningEncounter?.fragments.length ?? 0) > 0
  const isListeningEncounter = quest.type === "LISTENING" && hasListening

  const prep = quest.vocabularyPreparation
  const inPreparationPhase = hasActivePreparationPhase(quest)
  const showPrepBadge =
    prep &&
    (isVocabularyEncounter || isSpeechEncounter) &&
    collectTargets(quest)

  const flashClass =
    flash === "success"
      ? "nozomi-flash-success"
      : flash === "danger"
        ? "nozomi-flash-danger"
        : ""

  function pulseFlash(tone: "success" | "danger") {
    setFlash(tone)
    window.setTimeout(() => setFlash(null), 280)
  }

  async function handleSubmit(answer: string) {
    if (!onSubmitAnswer) return
    const result = await onSubmitAnswer(answer)
    if (!result) return

    if (result.encounterFailed) {
      setLastResult("Contract failed. Penalties applied.")
      pulseFlash("danger")
      return
    }

    if (result.correct) {
      setLastResult("Lock confirmed.")
      pulseFlash("success")
    } else {
      setLastResult("Signal degraded. The system is watching.")
      pulseFlash("danger")
    }
  }

  async function handleSend(message: string) {
    if (!onSendMessage) return null
    const result = await onSendMessage(message)
    if (!result) return null

    if (result.encounterFailed) {
      setLastResult("Contract failed. Penalties applied.")
      pulseFlash("danger")
    } else if (result.passed) {
      setLastResult("Exchange logged.")
      pulseFlash("success")
    } else {
      setLastResult(result.feedback)
      pulseFlash("danger")
    }
    return result
  }

  async function handleListening(answer: string) {
    if (!onSubmitListening) return
    const result = await onSubmitListening(answer)
    if (!result) return

    if (result.encounterFailed) {
      setLastResult("Contract failed. Penalties applied.")
      pulseFlash("danger")
      return
    }

    if (result.correct) {
      setLastResult("Transmission decoded.")
      pulseFlash("success")
    } else {
      setLastResult("Signal mismatch. Listen again.")
      pulseFlash("danger")
    }
  }

  async function handleSpeech(transcript: string, responseTimeMs: number) {
    if (!onSubmitSpeech) return
    const result = await onSubmitSpeech(transcript, responseTimeMs)
    if (!result) return

    if (result.encounterFailed) {
      setLastResult("Contract failed. Penalties applied.")
      pulseFlash("danger")
      return
    }

    if (result.passed) {
      setLastResult(`${result.feedback} (resonance ${result.compositeScore})`)
      pulseFlash("success")
    } else {
      setLastResult(result.feedback)
      pulseFlash("danger")
    }
  }

  const hasEncounterUi =
    isVocabularyEncounter ||
    isConversationEncounter ||
    isSpeechEncounter ||
    isListeningEncounter

  const contractActions =
    !inPreparationPhase ? (
      <QuestContractActions
        rewardXp={quest.rewards.xp}
        disabled={disabled}
        canComplete={!!canComplete}
        showProgress={!hasEncounterUi}
        onProgress={onProgress}
        onComplete={onComplete}
      />
    ) : null

  const encounterBlock =
    isVocabularyEncounter && onSubmitAnswer && onAbandon ? (
      <>
        <VocabularyEncounter
          quest={quest}
          disabled={disabled}
          onSubmit={handleSubmit}
          onAbandon={onAbandon}
          hideLegacyBriefing={inPreparationPhase}
          flashClassName={flashClass}
        />
        <EncounterFeedback
          message={lastResult}
          tone={lastResult ? feedbackToneFromMessage(lastResult) : "neutral"}
        />
      </>
    ) : isSpeechEncounter && onSubmitSpeech && onAbandon ? (
      <>
        <SpeechEncounter
          quest={quest}
          disabled={disabled}
          onSubmit={handleSpeech}
          onAbandon={onAbandon}
          hideLegacyBriefing={inPreparationPhase}
        />
        <EncounterFeedback
          message={lastResult}
          tone={lastResult ? feedbackToneFromMessage(lastResult) : "neutral"}
        />
      </>
    ) : isListeningEncounter && onSubmitListening && onAbandon ? (
      <>
        <ListeningEncounter
          quest={quest}
          disabled={disabled}
          maxWrongAttempts={maxWrongAttempts}
          maxReplays={maxListeningReplays}
          signalDegraded={signalDegraded}
          onSubmit={handleListening}
          onAbandon={onAbandon}
          flashClassName={flashClass}
        />
        <EncounterFeedback
          message={lastResult}
          tone={lastResult ? feedbackToneFromMessage(lastResult) : "neutral"}
        />
      </>
    ) : isConversationEncounter && onSendMessage && onAbandon ? (
      <ConversationEncounter
        quest={quest}
        disabled={disabled}
        onSend={handleSend}
        onAbandon={onAbandon}
        flashClassName={flashClass}
      />
    ) : (
      <Panel tone="inset" className="mb-3 !p-3">
        <p className="text-sm text-[var(--muted)]">
          Encounter data is loading — refresh the contract board.
        </p>
      </Panel>
    )

  return (
    <motion.div
      layout
      transition={MOTION.panel}
      className={canComplete && !inPreparationPhase ? "nozomi-contract-ready rounded-[var(--radius-panel)]" : ""}
    >
      <Panel
        as="article"
        tone={inPreparationPhase ? "accent" : "default"}
        className="transition-colors"
      >
        <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <h3 className="font-display font-semibold leading-snug text-[var(--foreground)]">
            {quest.title}
            {quest.isTutorial && (
              <span className="ml-2 text-xs font-normal text-[var(--muted)]">
                Tutorial
              </span>
            )}
            {inPreparationPhase && (
              <span className="ml-2">
                <StatusChip label="Briefing" tone="accent" pulse />
              </span>
            )}
          </h3>
          <StatusChip label={quest.type} tone="neutral" />
        </div>

        {showPrepBadge && prep && !inPreparationPhase && (
          <div className="mb-4">
            <PreparationScoreBar
              score={prep.preparationScore}
              label="Contract readiness"
            />
          </div>
        )}

        <p className="mb-3 text-sm text-[var(--muted)]">{quest.description}</p>

        <QuestPreparationGate
          quest={quest}
          disabled={disabled}
          onBriefingDismissed={onDismissPreparation}
        >
          <EncounterFocusShell
            title={quest.title}
            enabled={
              !inPreparationPhase &&
            (isVocabularyEncounter ||
              isConversationEncounter ||
              isSpeechEncounter ||
              isListeningEncounter)
            }
            autoFocus
            encounterClassName={encounterClassName}
            footer={hasEncounterUi ? contractActions ?? undefined : undefined}
          >
            {encounterBlock}
          </EncounterFocusShell>
          {!inPreparationPhase && hasEncounterUi && contractActions}
        </QuestPreparationGate>

        {!inPreparationPhase && !hasEncounterUi && contractActions}
      </Panel>
    </motion.div>
  )
}

function collectTargets(quest: QuestContract): boolean {
  return (
    (quest.vocabularyEncounter?.words.length ?? 0) > 0 ||
    (quest.speechEncounter?.phrases.length ?? 0) > 0
  )
}
