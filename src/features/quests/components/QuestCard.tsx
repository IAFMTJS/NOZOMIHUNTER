"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import type { QuestContract } from "@/contracts/quest-contract"
import type { PlayerContract } from "@/contracts/player-contract"
import { PreparationScoreBar } from "@/components/preparation/PreparationScoreBar"
import { Panel } from "@/components/ui/Panel"
import { StatusChip } from "@/components/ui/StatusChip"
import { EncounterRouter } from "@/features/encounters/EncounterRouter"
import { resolveQuestGameMode } from "@/systems/gameModes/gameModeSystem"
import { QuestPreparationGate } from "./QuestPreparationGate"
import { hasActivePreparationPhase } from "@/systems/vocabulary/vocabularyPreparationOrchestrator"
import { canCompleteQuest } from "@/systems/quests/questValidator"
import {
  isQuestEncounterPlayable,
  MISSION_DATA_CORRUPTED_COPY,
} from "@/systems/quests/questPlayabilitySystem"
import { EncounterFocusShell } from "@/components/ui/EncounterFocusShell"
import { QuestContractActions } from "./QuestContractActions"
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
  onGameModeAction?: (action: string, payload?: string) => Promise<void>
  player?: PlayerContract | null
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
  onGameModeAction,
  onAbandon,
  player,
  onDismissPreparation,
  disabled,
  encounterClassName = "",
  maxWrongAttempts,
  maxListeningReplays,
  signalDegraded,
}: QuestCardProps) {
  const [lastResult, setLastResult] = useState<string | null>(null)
  const [flash, setFlash] = useState<"success" | "danger" | null>(null)

  const canComplete = canCompleteQuest(quest)
  const mode = resolveQuestGameMode(quest)

  const hasWords = (quest.vocabularyEncounter?.words.length ?? 0) > 0
  const hasConversation = (quest.conversationEncounter?.messages.length ?? 0) > 0
  const isVocabularyEncounter = quest.type === "VOCABULARY" && hasWords
  const isConversationEncounter =
    quest.type === "CONVERSATION" && hasConversation
  const hasSpeech = (quest.speechEncounter?.phrases.length ?? 0) > 0
  const isSpeechEncounter = quest.type === "SPEECH" && hasSpeech
  const hasListening = (quest.listeningEncounter?.fragments.length ?? 0) > 0
  const isListeningEncounter = quest.type === "LISTENING" && hasListening
  const needsEncounter =
    quest.type === "VOCABULARY" ||
    quest.type === "CONVERSATION" ||
    quest.type === "SPEECH" ||
    quest.type === "LISTENING" ||
    mode !== "STANDARD"
  const dataCorrupted = needsEncounter && !isQuestEncounterPlayable(quest)

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
    if (!onSubmitAnswer) return null
    const result = await onSubmitAnswer(answer)
    if (!result) return null
    if (result.encounterFailed) {
      setLastResult("Contract failed. Penalties applied.")
      pulseFlash("danger")
      return result
    }
    setLastResult(result.correct ? "Lock confirmed." : "Signal degraded.")
    pulseFlash(result.correct ? "success" : "danger")
    return result
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
    if (!onSubmitListening) return null
    const result = await onSubmitListening(answer)
    if (!result) return null
    if (result.encounterFailed) {
      setLastResult("Contract failed. Penalties applied.")
      pulseFlash("danger")
      return result
    }
    setLastResult(result.correct ? "Transmission decoded." : "Signal mismatch.")
    pulseFlash(result.correct ? "success" : "danger")
    return result
  }

  async function handleSpeech(transcript: string, responseTimeMs: number) {
    if (!onSubmitSpeech) return null
    const result = await onSubmitSpeech(transcript, responseTimeMs)
    if (!result) return null
    if (result.encounterFailed) {
      setLastResult("Contract failed. Penalties applied.")
      pulseFlash("danger")
      return result
    }
    setLastResult(
      result.passed
        ? `${result.feedback} (resonance ${result.compositeScore})`
        : result.feedback
    )
    pulseFlash(result.passed ? "success" : "danger")
    return result
  }

  async function handleModeAction(action: string, payload?: string) {
    if (!onGameModeAction) return
    await onGameModeAction(action, payload)
  }

  const hasEncounterUi =
    mode !== "STANDARD" ||
    isVocabularyEncounter ||
    isConversationEncounter ||
    isSpeechEncounter ||
    isListeningEncounter

  const contractActions = !inPreparationPhase ? (
    <QuestContractActions
      rewardXp={quest.rewards.xp}
      disabled={disabled}
      canComplete={!!canComplete}
      showProgress={!hasEncounterUi}
      onProgress={onProgress}
      onComplete={onComplete}
    />
  ) : null

  const encounterBlock = dataCorrupted ? (
    <Panel tone="inset" className="mb-3 !p-3">
      <p className="text-sm text-[var(--warning)]">{MISSION_DATA_CORRUPTED_COPY}</p>
    </Panel>
  ) : (
    <EncounterRouter
      quest={quest}
      player={player}
      disabled={disabled}
      maxWrongAttempts={maxWrongAttempts}
      maxListeningReplays={maxListeningReplays}
      signalDegraded={signalDegraded}
      hideLegacyBriefing={inPreparationPhase}
      flashClassName={flashClass}
      lastResult={lastResult}
      onSubmitAnswer={onSubmitAnswer ? handleSubmit : undefined}
      onSendMessage={onSendMessage ? handleSend : undefined}
      onSubmitSpeech={onSubmitSpeech ? handleSpeech : undefined}
      onSubmitListening={onSubmitListening ? handleListening : undefined}
      onModeAction={onGameModeAction ? handleModeAction : undefined}
      onAbandon={onAbandon}
    />
  )

  return (
    <motion.div
      layout
      transition={MOTION.panel}
      className={
        canComplete && !inPreparationPhase
          ? "nozomi-contract-ready rounded-[var(--radius-panel)]"
          : ""
      }
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
          <div className="flex gap-2">
            {mode !== "STANDARD" && (
              <StatusChip label={mode.replace(/_/g, " ")} tone="accent" />
            )}
            <StatusChip label={quest.type} tone="neutral" />
          </div>
        </div>

        {showPrepBadge && prep && !inPreparationPhase && (
          <div className="mb-4">
            <PreparationScoreBar score={prep.preparationScore} label="Contract readiness" />
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
            enabled={!inPreparationPhase && hasEncounterUi}
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
