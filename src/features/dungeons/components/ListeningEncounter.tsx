"use client"

import { useEffect, useState } from "react"
import type { QuestContract } from "@/contracts/quest-contract"
import { getCurrentFragment } from "@/systems/dungeons/listeningEncounterSystem"
import { VOCABULARY_ENCOUNTER_CONFIG } from "@/config/vocabularyEncounterConfig"
import { useJapaneseTts } from "@/hooks/useJapaneseTts"
import { stopJapaneseSpeech } from "@/systems/listening/japaneseTtsSystem"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { EncounterTargetRail } from "@/components/ui/EncounterTargetRail"
import { ListeningFocusShell } from "@/components/ui/ListeningFocusShell"
import { AudioWaveform } from "@/components/ui/screen/AudioWaveform"
import { ListeningStationDisplay } from "@/components/ui/screen/ListeningStationDisplay"

interface ListeningEncounterProps {
  quest: QuestContract
  disabled?: boolean
  maxWrongAttempts?: number
  maxReplays?: number
  signalDegraded?: boolean
  focusMode?: boolean
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
  focusMode = false,
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

  function stopSignal() {
    tts.stop()
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

  const body = (
    <div className={`flex flex-col gap-6 ${flashClassName}`}>
      {!focusMode && (
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">
            Audio intercept
          </p>
          <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
            {encounter.briefing}
          </p>
          {signalDegraded && (
            <p className="mt-3 text-xs text-[var(--warning)]">
              Signal degraded — fewer retries and tighter error budget.
            </p>
          )}
        </div>
      )}

      {!focusMode && (
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
      )}

      {!focusMode && (
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--muted)]">
          Transmission {encounter.currentIndex + 1} / {encounter.fragments.length}
        </p>
      )}

      {focusMode && fragment && (
        <ListeningStationDisplay
          primaryLabel={fragment.japanese.slice(0, 8) || "秋葉原"}
          secondaryLabel={fragment.reading ?? "Signal corridor"}
        />
      )}

      <div
        className={`rounded-[var(--radius-panel)] px-4 py-8 ${
          focusMode ? "" : "nozomi-signal-well"
        }`}
      >
        <AudioWaveform levels={tts.waveformLevels} active={tts.playing} className="mb-6" />
        <p className="text-center text-sm text-[var(--foreground)]">
          {tts.playing
            ? "Receiving signal…"
            : heardOnce
              ? "Signal logged. Transmit your decode."
              : "No glyph on screen — listen first."}
        </p>
        {tts.error && (
          <p className="mt-2 text-center text-xs text-[var(--danger)]">{tts.error}</p>
        )}
        <div className="mt-6 flex flex-col items-center gap-3">
          {focusMode && tts.playing ? (
            <Button
              type="button"
              size="md"
              variant="primary"
              className="!border-[var(--accent)] !bg-[var(--glow-accent)]"
              onClick={stopSignal}
            >
              Tap to stop
            </Button>
          ) : (
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
          )}
        </div>
        {heardOnce && replaysLeft > 0 && !focusMode && (
          <p className="mt-3 text-center text-xs text-[var(--muted)]">
            Replays remaining: {replaysLeft}
          </p>
        )}
        {!tts.supported && (
          <p className="mt-3 text-center text-xs text-[var(--warning)]">
            TTS unavailable — use a browser with Japanese speech synthesis.
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Transmit decode (romaji, kana, or English)"
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={disabled || submitting}
          placeholder="e.g. mizu"
          autoComplete="off"
        />
        <p className="text-xs text-[var(--danger)]">
          Signal errors remaining: {wrongLeft}
        </p>
        <div className="flex flex-col gap-3">
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
    </div>
  )

  if (focusMode) {
    return <ListeningFocusShell>{body}</ListeningFocusShell>
  }

  return <div className="mt-3">{body}</div>
}
