"use client"

import { useState } from "react"
import type { QuestContract } from "@/contracts/quest-contract"
import { VocabularyEncounter } from "./VocabularyEncounter"
import { ConversationEncounter } from "@/features/conversation/components/ConversationEncounter"
import { SpeechEncounter } from "@/features/speech/components/SpeechEncounter"

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
  onAbandon?: () => Promise<void>
  disabled?: boolean
}

export function QuestCard({
  quest,
  onProgress,
  onComplete,
  onSubmitAnswer,
  onSendMessage,
  onSubmitSpeech,
  onAbandon,
  disabled,
}: QuestCardProps) {
  const [lastResult, setLastResult] = useState<string | null>(null)

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

  async function handleSubmit(answer: string) {
    if (!onSubmitAnswer) return
    const result = await onSubmitAnswer(answer)
    if (!result) return

    if (result.encounterFailed) {
      setLastResult("Contract failed. Penalties applied.")
      return
    }

    setLastResult(
      result.correct
        ? "Target identified."
        : "Incorrect. The system is watching."
    )
  }

  async function handleSend(message: string) {
    if (!onSendMessage) return null
    const result = await onSendMessage(message)
    if (!result) return null

    if (result.encounterFailed) {
      setLastResult("Contract failed. Penalties applied.")
    } else {
      setLastResult(result.feedback)
    }
    return result
  }

  async function handleSpeech(transcript: string, responseTimeMs: number) {
    if (!onSubmitSpeech) return
    const result = await onSubmitSpeech(transcript, responseTimeMs)
    if (!result) return

    if (result.encounterFailed) {
      setLastResult("Contract failed. Penalties applied.")
      return
    }

    setLastResult(
      `${result.feedback} (resonance ${result.compositeScore})`
    )
  }

  return (
    <article className="rounded border border-white/10 bg-white/5 p-4">
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="font-semibold text-[var(--accent)]">
          {quest.title}
          {quest.isTutorial && (
            <span className="ml-2 text-xs font-normal text-[var(--muted)]">
              Tutorial
            </span>
          )}
        </h3>
        <span className="text-xs uppercase text-[var(--muted)]">
          {quest.type}
        </span>
      </div>
      <p className="mb-3 text-sm text-[var(--muted)]">{quest.description}</p>

      {isVocabularyEncounter && onSubmitAnswer && onAbandon ? (
        <>
          <VocabularyEncounter
            quest={quest}
            disabled={disabled}
            onSubmit={handleSubmit}
            onAbandon={onAbandon}
          />
          {lastResult && (
            <p
              className={`mt-2 text-sm ${
                lastResult.includes("failed")
                  ? "text-[var(--danger)]"
                  : "text-[var(--muted)]"
              }`}
            >
              {lastResult}
            </p>
          )}
        </>
      ) : isSpeechEncounter && onSubmitSpeech && onAbandon ? (
        <>
          <SpeechEncounter
            quest={quest}
            disabled={disabled}
            onSubmit={handleSpeech}
            onAbandon={onAbandon}
          />
          {lastResult && (
            <p
              className={`mt-2 text-sm ${
                lastResult.includes("failed")
                  ? "text-[var(--danger)]"
                  : "text-[var(--muted)]"
              }`}
            >
              {lastResult}
            </p>
          )}
        </>
      ) : isConversationEncounter && onSendMessage && onAbandon ? (
        <>
          <ConversationEncounter
            quest={quest}
            disabled={disabled}
            onSend={handleSend}
            onAbandon={onAbandon}
          />
          {lastResult && (
            <p
              className={`mt-2 text-sm ${
                lastResult.includes("failed")
                  ? "text-[var(--danger)]"
                  : "text-[var(--muted)]"
              }`}
            >
              {lastResult}
            </p>
          )}
        </>
      ) : (
        <p className="mb-3 rounded border border-white/10 bg-black/20 p-3 text-sm text-[var(--muted)]">
          Encounter data is loading — refresh the dashboard.
        </p>
      )}

      <p className="mb-3 text-sm">Reward: {quest.rewards.xp} XP</p>

      <div className="flex gap-2">
        {!isVocabularyEncounter &&
          !isConversationEncounter &&
          !isSpeechEncounter && (
          <button
            type="button"
            disabled={disabled}
            onClick={onProgress}
            className="rounded border border-white/20 px-3 py-1 text-sm hover:bg-white/10 disabled:opacity-50"
          >
            Progress
          </button>
        )}
        <button
          type="button"
          disabled={disabled || !canComplete}
          onClick={onComplete}
          className="rounded border border-[var(--accent)] px-3 py-1 text-sm text-[var(--accent)] hover:bg-[var(--accent)] hover:text-black disabled:opacity-50"
        >
          Complete
        </button>
      </div>
    </article>
  )
}
