"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import type { QuestContract } from "@/contracts/quest-contract"
import { getQuestBriefing } from "@/systems/quests/questGenerator"
import { CONVERSATION_ENCOUNTER_CONFIG } from "@/config/conversationEncounterConfig"
import { MOTION } from "@/config/motionPresets"
import { LearnerMessageText } from "@/components/JapaneseText"
import { Panel } from "@/components/ui/Panel"
import { Button } from "@/components/ui/Button"
import {
  EncounterFeedback,
  feedbackToneFromMessage,
} from "@/components/ui/EncounterFeedback"

interface ConversationEncounterProps {
  quest: QuestContract
  disabled?: boolean
  onSend: (message: string) => Promise<{
    passed: boolean
    encounterFailed: boolean
    feedback: string
  } | null>
  onAbandon: () => Promise<void>
  flashClassName?: string
}

export function ConversationEncounter({
  quest,
  disabled,
  onSend,
  onAbandon,
  flashClassName = "",
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
        Dialogue data missing. Refresh the contract board.
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
          : result.passed
            ? "Exchange logged."
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
    <Panel tone="inset" className={`mt-3 ${flashClassName}`}>
      {briefing && (
        <p className="mb-3 text-sm italic text-[var(--muted)]">{briefing}</p>
      )}

      <p className="mb-2 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
        Sector uplink · {encounter.directorName} · Exchanges{" "}
        {encounter.successfulExchanges}/{encounter.requiredExchanges}
      </p>

      <ul className="mb-4 max-h-56 space-y-2 overflow-y-auto pr-1">
        <AnimatePresence initial={false}>
          {encounter.messages.map((msg) => (
            <motion.li
              key={msg.id}
              layout
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={MOTION.feedback}
              className={`rounded px-3 py-2.5 text-sm ${
                msg.role === "director"
                  ? "border border-[var(--accent)]/40 bg-[var(--accent)]/10 shadow-[inset_0_0_20px_var(--glow-accent)]"
                  : "border border-white/10 bg-white/5"
              }`}
            >
              <span className="mr-2 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
                {msg.role === "director" ? encounter.directorName : "You"}
              </span>
              <LearnerMessageText
                content={msg.content}
                reading={msg.reading}
                className="mt-1 block"
              />
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      <form onSubmit={handleSend} className="flex flex-col gap-3">
        <label className="text-sm text-[var(--muted)]">
          Transmit (Japanese or English)
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={disabled || sending}
            rows={2}
            className="mt-1 min-h-11 w-full resize-none rounded border border-[var(--border-subtle)] bg-[var(--surface-2)] px-3 py-2 text-base text-[var(--foreground)] outline-none focus:border-[var(--accent)]/60 sm:min-h-0 sm:text-sm"
            placeholder="e.g. junbi dekite imasu (準備できています) or I am ready"
          />
        </label>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Button
            type="submit"
            size="md"
            disabled={disabled || sending || !message.trim()}
            className="w-full sm:w-auto"
          >
            {sending ? "Transmitting..." : "Transmit"}
          </Button>
          <Button
            variant="ghost"
            size="md"
            disabled={disabled || sending}
            onClick={onAbandon}
            className="w-full sm:w-auto"
          >
            Abort contract
          </Button>
        </div>
      </form>

      {objective && (
        <p className="mt-3 text-sm text-[var(--muted)]">
          Logged exchanges: {objective.currentProgress}/
          {objective.requiredProgress} · Failed turns remaining: {wrongLeft}
        </p>
      )}
      <EncounterFeedback
        message={feedback}
        tone={feedback ? feedbackToneFromMessage(feedback) : "neutral"}
      />
    </Panel>
  )
}
