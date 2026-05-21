"use client"

import { useState } from "react"
import type { QuestContract } from "@/contracts/quest-contract"
import { getQuestBriefing } from "@/systems/quests/questGenerator"
import { CONVERSATION_ENCOUNTER_CONFIG } from "@/config/conversationEncounterConfig"
import { LearnerMessageText } from "@/components/JapaneseText"

interface ConversationEncounterProps {
  quest: QuestContract
  disabled?: boolean
  onSend: (message: string) => Promise<{
    passed: boolean
    encounterFailed: boolean
    feedback: string
  } | null>
  onAbandon: () => Promise<void>
}

export function ConversationEncounter({
  quest,
  disabled,
  onSend,
  onAbandon,
}: ConversationEncounterProps) {
  const [message, setMessage] = useState("")
  const [feedback, setFeedback] = useState<string | null>(null)
  const [sending, setSending] = useState(false)

  const encounter = quest.conversationEncounter
  const objective = quest.objectives[0]
  const briefing = getQuestBriefing(quest)

  if (!encounter?.messages.length) {
    return (
      <p className="mt-3 text-sm text-[var(--danger)]">
        Dialogue data missing. Refresh the dashboard.
      </p>
    )
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    if (!message.trim() || sending) return
    setSending(true)
    setFeedback(null)
    try {
      const result = await onSend(message.trim())
      if (!result) return
      setMessage("")
      setFeedback(
        result.encounterFailed
          ? "Link severed. Contract failed."
          : result.feedback
      )
    } finally {
      setSending(false)
    }
  }

  const wrongLeft = Math.max(
    0,
    CONVERSATION_ENCOUNTER_CONFIG.MAX_WRONG_TURNS - encounter.wrongTurns
  )

  return (
    <div className="mt-3 rounded border border-white/10 bg-black/20 p-4">
      {briefing && (
        <p className="mb-3 text-sm italic text-[var(--muted)]">{briefing}</p>
      )}

      <p className="mb-2 text-xs uppercase text-[var(--muted)]">
        {encounter.directorName} · Exchanges{" "}
        {encounter.successfulExchanges}/{encounter.requiredExchanges}
      </p>

      <ul className="mb-4 max-h-48 space-y-2 overflow-y-auto pr-1">
        {encounter.messages.map((msg) => (
          <li
            key={msg.id}
            className={`rounded px-3 py-2 text-sm ${
              msg.role === "director"
                ? "border border-[var(--accent)]/30 bg-[var(--accent)]/5"
                : "border border-white/10 bg-white/5"
            }`}
          >
            <span className="mr-2 text-xs uppercase text-[var(--muted)]">
              {msg.role === "director" ? encounter.directorName : "You"}
            </span>
            <LearnerMessageText
              content={msg.content}
              reading={msg.reading}
              className="block"
            />
          </li>
        ))}
      </ul>

      <form onSubmit={handleSend} className="flex flex-col gap-3">
        <label className="text-sm text-[var(--muted)]">
          Your message (Japanese or English)
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={disabled || sending}
            rows={2}
            className="mt-1 w-full resize-none rounded border border-white/20 bg-black/30 px-3 py-2 text-[var(--foreground)]"
            placeholder="e.g. junbi dekite imasu (準備できています) or I am ready"
          />
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={disabled || sending || !message.trim()}
            className="rounded border border-[var(--accent)] px-3 py-1 text-sm text-[var(--accent)] hover:bg-[var(--accent)] hover:text-black disabled:opacity-50"
          >
            {sending ? "Transmitting..." : "Send"}
          </button>
          <button
            type="button"
            disabled={disabled || sending}
            onClick={onAbandon}
            className="rounded border border-white/20 px-3 py-1 text-sm text-[var(--muted)] hover:bg-white/10 disabled:opacity-50"
          >
            Abandon
          </button>
        </div>
      </form>

      {objective && (
        <p className="mt-3 text-sm text-[var(--muted)]">
          Logged exchanges: {objective.currentProgress}/
          {objective.requiredProgress} · Failed turns remaining: {wrongLeft}
        </p>
      )}
      {feedback && (
        <p
          className={`mt-2 text-sm ${
            feedback.includes("failed") || feedback.includes("severed")
              ? "text-[var(--danger)]"
              : "text-[var(--muted)]"
          }`}
        >
          {feedback}
        </p>
      )}
    </div>
  )
}
