"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import type { QuestContract } from "@/contracts/quest-contract"
import { getCurrentFragment } from "@/systems/dungeons/listeningEncounterSystem"
import { VOCABULARY_ENCOUNTER_CONFIG } from "@/config/vocabularyEncounterConfig"
import { MOTION } from "@/config/motionPresets"
import { useJapaneseTts } from "@/hooks/useJapaneseTts"
import { stopJapaneseSpeech } from "@/systems/listening/japaneseTtsSystem"
import { Panel } from "@/components/ui/Panel"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { EncounterTargetRail } from "@/components/ui/EncounterTargetRail"

interface ListeningEncounterProps {
  quest: QuestContract
  disabled?: boolean
  maxWrongAttempts?: number
  maxReplays?: number
  signalDegraded?: boolean
  onSubmit: (answer: string) => Promise<void>
  onAbandon: () => Promise<void>
  flashClassName?: string
}

export function ListeningEncounter({
  quest,
  disabled,
  maxWrongAttempts = VOCABULARY_ENCOUNTER_CONFIG.MAX_WRONG_ATTEMPTS,
  maxReplays = 3,
  signalDegraded = false,
  onSubmit,
  onAbandon,
  flashClassName = "",
}: ListeningEncounterProps) {
  const [answer, setAnswer] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [heardOnce, setHeardOnce] = useState(false)
  const [replayCount, setReplayCount] = useState(0)
  const tts = useJapaneseTts()

  const encounter = quest.listeningEncounter
  const fragment = encounter ? getCurrentFragment(encounter) : null
  const wrongLeft = encounter
    ? Math.max(0, maxWrongAttempts - encounter.wrongAttempts)
    : 0
  const replaysLeft = Math.max(0, maxReplays - replayCount)

  useEffect(() => {
    setHeardOnce(false)
    setReplayCount(0)
    return () => stopJapaneseSpeech()
  }, [encounter?.currentIndex, fragment?.id])

  async function playSignal() {
    if (!fragment || replayCount >= maxReplays) return
    await tts.play(fragment.japanese, fragment.reading)
    if (!tts.error) {
      setHeardOnce(true)
      setReplayCount((n) => n + 1)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!answer.trim() || submitting) return
    setSubmitting(true)
    try {
      await onSubmit(answer.trim())
      setAnswer("")
      setHeardOnce(false)
    } finally {
      setSubmitting(false)
    }
  }

  if (!encounter?.fragments.length || !fragment) {
    return (
      <p className="text-sm text-[var(--danger)]">Listening signal unavailable.</p>
    )
  }

  return (
    <Panel tone="inset" className={`mt-3 ${flashClassName}`}>
      <p className="mb-2 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
        Audio intercept
      </p>
      <p className="mb-4 text-sm text-[var(--muted)]">{encounter.briefing}</p>
      {signalDegraded && (
        <p className="mb-3 text-xs text-[var(--warning)]">
          Signal degraded — fewer retries and tighter error budget.
        </p>
      )}

      <EncounterTargetRail
        items={encounter.fragments.map((f, i) => {
          const done = i < encounter.currentIndex
          const current = i === encounter.currentIndex
          return {
            id: f.id,
            state: done ? "done" : current ? "current" : "hidden",
            content: <span className="font-medium">{i + 1}</span>,
          }
        })}
      />

      <p className="mb-1 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
        Transmission {encounter.currentIndex + 1} / {encounter.fragments.length}
      </p>

      <div className="mb-4 rounded-lg border border-[var(--border-accent)] bg-[var(--accent-dim)] px-4 py-6">
        <div
          className="mb-4 flex h-12 items-end justify-center gap-1"
          aria-hidden
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <motion.span
              key={i}
              className="w-1 rounded-full bg-[var(--accent)]"
              animate={
                tts.playing
                  ? {
                      height: [8, 28, 12, 32, 10][i % 5],
                    }
                  : { height: 8 }
              }
              transition={
                tts.playing
                  ? {
                      duration: 0.35,
                      repeat: Infinity,
                      repeatType: "reverse",
                      delay: i * 0.04,
                    }
                  : MOTION.feedback
              }
            />
          ))}
        </div>
        <p className="text-center text-sm text-[var(--muted)]">
          {tts.playing
            ? "Receiving signal…"
            : heardOnce
              ? "Signal logged. Transmit your decode."
              : "No glyph on screen — listen first."}
        </p>
        {tts.error && (
          <p className="mt-2 text-center text-xs text-[var(--danger)]">{tts.error}</p>
        )}
        <div className="mt-4 flex justify-center">
          <Button
            type="button"
            size="md"
            disabled={
              disabled ||
              tts.playing ||
              !tts.supported ||
              replayCount >= maxReplays
            }
            onClick={() => void playSignal()}
          >
            {tts.playing
              ? "Playing…"
              : heardOnce
                ? "Replay signal"
                : "Receive signal"}
          </Button>
        </div>
        {heardOnce && replaysLeft > 0 && (
          <p className="mt-2 text-center text-xs text-[var(--muted)]">
            Replays remaining: {replaysLeft}
          </p>
        )}
        {replayCount >= maxReplays && !tts.playing && (
          <p className="mt-2 text-center text-xs text-[var(--warning)]">
            Replay buffer exhausted for this transmission.
          </p>
        )}
        {!tts.supported && (
          <p className="mt-2 text-center text-xs text-[var(--warning)]">
            TTS unavailable — use a browser with Japanese speech synthesis.
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Input
          label="Transmit decode (romaji, kana, or English)"
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={disabled || submitting}
          placeholder="e.g. mizu"
          autoComplete="off"
        />
        <p className="text-xs text-[var(--muted)]">
          Signal errors remaining: {wrongLeft}
        </p>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Button
            type="submit"
            size="md"
            disabled={disabled || submitting || !answer.trim()}
            className="w-full sm:w-auto"
          >
            {submitting ? "Verifying…" : "Transmit decode"}
          </Button>
          <Button
            type="button"
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
    </Panel>
  )
}
