"use client"

import type { QuestContract } from "@/contracts/quest-contract"
import type { PlayerContract } from "@/contracts/player-contract"
import { resolveQuestGameMode, effectiveAssistLevel } from "@/systems/gameModes/gameModeSystem"
import { LearnerAssistProvider } from "@/features/encounters/context/LearnerAssistContext"
import { storyScreenClass } from "@/systems/presentation/storyMissionPresentation"
import {
  EncounterFeedback,
  feedbackToneFromMessage,
} from "@/components/ui/EncounterFeedback"
import { EncounterFeedbackProvider } from "@/features/encounters/context/EncounterFeedbackContext"
import { EncounterFeedbackBridge } from "@/features/encounters/EncounterFeedbackBridge"
import { renderEncounterMode } from "./encounterModeRegistry"

export interface EncounterRouterProps {
  quest: QuestContract
  player?: PlayerContract | null
  disabled?: boolean
  encounterClassName?: string
  maxWrongAttempts?: number
  maxListeningReplays?: number
  signalDegraded?: boolean
  hideLegacyBriefing?: boolean
  flashClassName?: string
  lastResult?: string | null
  onSubmitAnswer?: (answer: string) => Promise<{
    correct: boolean
    encounterFailed: boolean
    pressureLine?: string | null
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
    pressureLine?: string | null
  } | null>
  onModeAction?: (action: string, payload?: string) => Promise<void>
  onAbandon?: () => Promise<void>
}

export function EncounterRouter(props: EncounterRouterProps) {
  const {
    quest,
    player,
    disabled,
    maxWrongAttempts,
    maxListeningReplays,
    signalDegraded,
    hideLegacyBriefing,
    flashClassName = "",
    lastResult,
    onSubmitAnswer,
    onSendMessage,
    onSubmitSpeech,
    onSubmitListening,
    onModeAction,
    onAbandon,
  } = props

  const mode = resolveQuestGameMode(quest)
  const assist = player ? effectiveAssistLevel(player, mode) : "FULL"
  const abandon = onAbandon ?? (async () => {})

  const feedback = lastResult ? (
    <EncounterFeedback
      message={lastResult}
      tone={feedbackToneFromMessage(lastResult)}
    />
  ) : null

  const channelClass = storyScreenClass(quest.narrativeTier)

  return (
    <EncounterFeedbackProvider quest={quest} isTraining={quest.hidden}>
      <EncounterFeedbackBridge />
      <LearnerAssistProvider level={assist}>
        <div className={channelClass}>
          {renderEncounterMode({
            mode,
            quest,
            player,
            disabled,
            maxWrongAttempts: mode === "SURVIVAL_VOCAB" ? 1 : maxWrongAttempts,
            maxListeningReplays,
            signalDegraded,
            hideLegacyBriefing,
            flashClassName,
            feedback,
            onSubmitAnswer,
            onSendMessage,
            onSubmitSpeech,
            onSubmitListening,
            onModeAction,
            onAbandon: abandon,
          })}
        </div>
      </LearnerAssistProvider>
    </EncounterFeedbackProvider>
  )
}
