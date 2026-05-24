"use client"

import type { QuestContract } from "@/contracts/quest-contract"
import type { PlayerContract } from "@/contracts/player-contract"
import { resolveQuestGameMode, effectiveAssistLevel } from "@/systems/gameModes/gameModeSystem"
import { LearnerAssistProvider } from "@/features/encounters/context/LearnerAssistContext"
import { VocabularyEncounter } from "@/features/quests/components/VocabularyEncounter"
import { ConversationEncounter } from "@/features/conversation/components/ConversationEncounter"
import { SpeechEncounter } from "@/features/speech/components/SpeechEncounter"
import { ListeningEncounter } from "@/features/dungeons/components/ListeningEncounter"
import { SignalCalibrationEncounter } from "@/features/encounters/modes/SignalCalibrationEncounter"
import { ShadowEchoEncounter } from "@/features/encounters/modes/ShadowEchoEncounter"
import { LostTransmissionEncounter } from "@/features/encounters/modes/LostTransmissionEncounter"
import { GhostInterrogationEncounter } from "@/features/encounters/modes/GhostInterrogationEncounter"
import { KanjiSurgeryEncounter } from "@/features/encounters/modes/KanjiSurgeryEncounter"
import { MemoryCascadeEncounter } from "@/features/encounters/modes/MemoryCascadeEncounter"
import { TerminalBreachEncounter } from "@/features/encounters/modes/TerminalBreachEncounter"
import { SemanticNetworkEncounter } from "@/features/encounters/modes/SemanticNetworkEncounter"
import { Panel } from "@/components/ui/Panel"
import {
  EncounterFeedback,
  feedbackToneFromMessage,
} from "@/components/ui/EncounterFeedback"

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
  onModeAction?: (action: string, payload?: string) => Promise<void>
  onAbandon?: () => Promise<void>
}

export function EncounterRouter({
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
}: EncounterRouterProps) {
  const mode = resolveQuestGameMode(quest)
  const assist = player
    ? effectiveAssistLevel(player, mode)
    : "FULL"

  const abandon = onAbandon ?? (async () => {})

  const feedback = lastResult ? (
    <EncounterFeedback
      message={lastResult}
      tone={feedbackToneFromMessage(lastResult)}
    />
  ) : null

  return (
    <LearnerAssistProvider level={assist}>
      {renderModeBody({
        mode,
        quest,
        disabled,
        maxWrongAttempts,
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
    </LearnerAssistProvider>
  )
}

function renderModeBody(ctx: {
  mode: ReturnType<typeof resolveQuestGameMode>
  quest: QuestContract
  disabled?: boolean
  maxWrongAttempts?: number
  maxListeningReplays?: number
  signalDegraded?: boolean
  hideLegacyBriefing?: boolean
  flashClassName: string
  feedback: React.ReactNode
  onSubmitAnswer?: EncounterRouterProps["onSubmitAnswer"]
  onSendMessage?: EncounterRouterProps["onSendMessage"]
  onSubmitSpeech?: EncounterRouterProps["onSubmitSpeech"]
  onSubmitListening?: EncounterRouterProps["onSubmitListening"]
  onModeAction?: EncounterRouterProps["onModeAction"]
  onAbandon: () => Promise<void>
}) {
  const {
    mode,
    quest,
    disabled,
    maxWrongAttempts,
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
    onAbandon,
  } = ctx

  switch (mode) {
    case "SIGNAL_CALIBRATION":
      if (!onSubmitListening) break
      return (
        <>
          <SignalCalibrationEncounter
            quest={quest}
            disabled={disabled}
            maxWrongAttempts={maxWrongAttempts}
            maxReplays={maxListeningReplays}
            signalDegraded={signalDegraded}
            onSubmit={async (a) => {
              await onSubmitListening(a)
            }}
            onAbandon={onAbandon}
            flashClassName={flashClassName}
          />
          {feedback}
        </>
      )
    case "LOST_TRANSMISSION":
      if (!onSubmitListening) break
      return (
        <>
          <LostTransmissionEncounter
            quest={quest}
            disabled={disabled}
            maxWrongAttempts={maxWrongAttempts}
            maxReplays={maxListeningReplays}
            signalDegraded={signalDegraded}
            onSubmit={async (a) => {
              await onSubmitListening(a)
            }}
            onAbandon={onAbandon}
            flashClassName={flashClassName}
          />
          {feedback}
        </>
      )
    case "SHADOW_ECHO":
      if (!onSubmitSpeech) break
      return (
        <>
          <ShadowEchoEncounter
            quest={quest}
            disabled={disabled}
            onSubmit={async (t, ms) => {
              await onSubmitSpeech(t, ms)
            }}
            onAbandon={onAbandon}
          />
          {feedback}
        </>
      )
    case "GHOST_INTERROGATION":
    case "DEEP_COVER":
    case "PANIC_CHANNEL":
      if (!onSendMessage) break
      return (
        <GhostInterrogationEncounter
          quest={quest}
          disabled={disabled}
          onSend={async (m) => {
            const r = await onSendMessage(m)
            return r ?? { passed: false, encounterFailed: false, feedback: "" }
          }}
          onAbandon={onAbandon}
          flashClassName={flashClassName}
        />
      )
    case "KANJI_SURGERY":
      return (
        <KanjiSurgeryEncounter
          quest={quest}
          disabled={disabled}
          onStabilize={async (id, ok) => {
            await onModeAction?.("kanji-stabilize", `${id}:${ok}`)
          }}
          onAbandon={onAbandon}
        />
      )
    case "MEMORY_CASCADE":
      return (
        <MemoryCascadeEncounter
          quest={quest}
          disabled={disabled}
          onIdentifyIntruder={async (id) => {
            await onModeAction?.("memory-intruder", id)
          }}
          onAbandon={onAbandon}
        />
      )
    case "TERMINAL_BREACH":
      return (
        <TerminalBreachEncounter
          quest={quest}
          disabled={disabled}
          onInterpret={async (id) => {
            await onModeAction?.("terminal-interpret", id)
          }}
          onAbandon={onAbandon}
        />
      )
    case "SEMANTIC_NETWORK":
      return (
        <SemanticNetworkEncounter
          quest={quest}
          disabled={disabled}
          onLink={async (from, to) => {
            await onModeAction?.("semantic-link", `${from}:${to}`)
          }}
          onAbandon={onAbandon}
        />
      )
    default:
      break
  }

  if (quest.type === "VOCABULARY" && onSubmitAnswer) {
    return (
      <>
        <VocabularyEncounter
          quest={quest}
          disabled={disabled}
          onSubmit={async (a) => {
            await onSubmitAnswer(a)
          }}
          onAbandon={onAbandon}
          hideLegacyBriefing={hideLegacyBriefing}
          flashClassName={flashClassName}
        />
        {feedback}
      </>
    )
  }
  if (quest.type === "SPEECH" && onSubmitSpeech) {
    return (
      <>
        <SpeechEncounter
          quest={quest}
          disabled={disabled}
          onSubmit={async (t, ms) => {
            await onSubmitSpeech(t, ms)
          }}
          onAbandon={onAbandon}
          hideLegacyBriefing={hideLegacyBriefing}
        />
        {feedback}
      </>
    )
  }
  if (quest.type === "LISTENING" && onSubmitListening) {
    return (
      <>
        <ListeningEncounter
          quest={quest}
          disabled={disabled}
          maxWrongAttempts={maxWrongAttempts}
          maxReplays={maxListeningReplays}
          signalDegraded={signalDegraded}
          focusMode
          onSubmit={async (a) => {
            await onSubmitListening(a)
          }}
          onAbandon={onAbandon}
          flashClassName={flashClassName}
        />
        {feedback}
      </>
    )
  }
  if (quest.type === "CONVERSATION" && onSendMessage) {
    return (
      <ConversationEncounter
        quest={quest}
        disabled={disabled}
        onSend={onSendMessage}
        onAbandon={onAbandon}
        flashClassName={flashClassName}
      />
    )
  }

  return (
    <Panel tone="inset" className="mb-3 !p-3">
      <p className="text-sm text-[var(--warning)]">
        Encounter data is loading — refresh the contract board.
      </p>
    </Panel>
  )
}
