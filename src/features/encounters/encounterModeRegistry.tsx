"use client"

import type { ReactNode } from "react"
import type { QuestContract } from "@/contracts/quest-contract"
import type { PlayerContract } from "@/contracts/player-contract"
import { resolveQuestGameMode } from "@/systems/gameModes/gameModeSystem"
import type { EncounterRouterProps } from "./EncounterRouter"
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
import { KanaDashEncounter } from "@/features/encounters/modes/KanaDashEncounter"
import { EchoListeningEncounter } from "@/features/encounters/modes/EchoListeningEncounter"
import { ShadowTypingEncounter } from "@/features/encounters/modes/ShadowTypingEncounter"
import { MemoryGridEncounter } from "@/features/encounters/modes/MemoryGridEncounter"
import { SurvivalVocabEncounter } from "@/features/encounters/modes/SurvivalVocabEncounter"
import { storyScreenClass } from "@/systems/presentation/storyMissionPresentation"
import { TerminalBreachEncounter } from "@/features/encounters/modes/TerminalBreachEncounter"
import { SemanticNetworkEncounter } from "@/features/encounters/modes/SemanticNetworkEncounter"
import { EntityHuntEncounter } from "@/features/encounters/modes/EntityHuntEncounter"
import { DeepCoverEncounter } from "@/features/encounters/modes/DeepCoverEncounter"
import { Panel } from "@/components/ui/Panel"
export type EncounterModeRenderContext = {
  mode: ReturnType<typeof resolveQuestGameMode>
  quest: QuestContract
  player?: PlayerContract | null
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
}

export function renderEncounterMode(ctx: EncounterModeRenderContext) {
  const {
    mode,
    quest,
    player,
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
            player={player}
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
            player={player}
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
            player={player}
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
    case "ECHO_LISTENING":
      return (
        <>
          <EchoListeningEncounter
            quest={quest}
            disabled={disabled}
            onHeard={async () => {
              await onModeAction?.("echo-heard")
            }}
            onSelectChunk={async (id) => {
              await onModeAction?.("echo-chunk", id)
            }}
            onSubmit={async () => {
              await onModeAction?.("echo-submit")
            }}
            onAbandon={onAbandon}
          />
          {feedback}
        </>
      )
    case "SHADOW_TYPING":
      if (!onSubmitAnswer) break
      return (
        <>
          <ShadowTypingEncounter
            quest={quest}
            player={player}
            disabled={disabled}
            flashClassName={flashClassName}
            onSubmit={async (a) => {
              await onSubmitAnswer(a)
            }}
            onAbandon={onAbandon}
          />
          {feedback}
        </>
      )
    case "MEMORY_GRID":
      return (
        <>
          <MemoryGridEncounter
            quest={quest}
            disabled={disabled}
            onFlip={async (id) => {
              await onModeAction?.("memory-grid-flip", id)
            }}
            onAbandon={onAbandon}
          />
          {feedback}
        </>
      )
    case "SURVIVAL_VOCAB":
      if (!onSubmitAnswer) break
      return (
        <>
          <SurvivalVocabEncounter
            quest={quest}
            player={player}
            disabled={disabled}
            flashClassName={flashClassName}
            onSubmit={async (a) => {
              await onSubmitAnswer(a)
            }}
            onAbandon={onAbandon}
          />
          {feedback}
        </>
      )
    case "KANA_DASH":
      if (!onSubmitAnswer) break
      return (
        <>
          <KanaDashEncounter
            quest={quest}
            player={player}
            disabled={disabled}
            flashClassName={flashClassName}
            onSubmit={async (a) => {
              await onSubmitAnswer(a)
            }}
            onAbandon={onAbandon}
          />
          {feedback}
        </>
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
    case "ENTITY_HUNT":
      if (!onSubmitAnswer) break
      return (
        <>
          <EntityHuntEncounter
            quest={quest}
            player={player}
            disabled={disabled}
            flashClassName={flashClassName}
            onSubmit={async (a) => {
              await onSubmitAnswer(a)
            }}
            onAbandon={onAbandon}
          />
          {feedback}
        </>
      )
    case "DEEP_COVER":
      if (!onSendMessage) break
      return (
        <DeepCoverEncounter
          quest={quest}
          disabled={disabled}
          onSend={onSendMessage}
          onAbandon={onAbandon}
          flashClassName={flashClassName}
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
          player={player}
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
          player={player}
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
          player={player}
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