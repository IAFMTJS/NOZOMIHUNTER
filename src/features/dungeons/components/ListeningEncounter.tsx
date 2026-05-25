"use client"

import { useEffect, useState } from "react"
import type { QuestContract } from "@/contracts/quest-contract"
import {
  getCurrentFragment,
  recordListeningReplay,
} from "@/systems/dungeons/listeningEncounterSystem"
import {
  inputModeLabel,
  inputModePlaceholder,
} from "@/systems/learning/challengeDisplaySystem"
import { pressureFeedbackLine } from "@/systems/learning/encounterPressureSystem"
import { VOCABULARY_ENCOUNTER_CONFIG } from "@/config/vocabularyEncounterConfig"
import { useJapaneseTts } from "@/hooks/useJapaneseTts"
import { stopJapaneseSpeech } from "@/systems/listening/japaneseTtsSystem"
import { EncounterDisplayProvider } from "@/features/encounters/EncounterDisplayProvider"
import type { PlayerContract } from "@/contracts/player-contract"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { EncounterTargetRail } from "@/components/ui/EncounterTargetRail"
import { ListeningFocusShell } from "@/components/ui/ListeningFocusShell"
import { AudioWaveform } from "@/components/ui/screen/AudioWaveform"
import { ListeningStationDisplay } from "@/components/ui/screen/ListeningStationDisplay"
import { ComboMeter } from "@/components/ceremonies/ComboMeter"

interface ListeningEncounterProps {
  quest: QuestContract
  player?: PlayerContract | null
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
  player,
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
  const [playCount, setPlayCount] = useState(0)
  const [replayLine, setReplayLine] = useState<string | null>(null)
  const tts = useJapaneseTts()

  const encounter = quest.listeningEncounter
  const fragment = encounter ? getCurrentFragment(encounter) : null
  const wrongLeft = encounter
    ? Math.max(0, maxWrongAttempts - encounter.wrongAttempts)
    : 0
  const playsLeft = Math.max(0, maxReplays - playCount)
  const inputMode = fragment?.inputMode ?? "romaji"
  const pressureLine = encounter
    ? pressureFeedbackLine({
        correctStreak: encounter.correctStreak ?? 0,
        wrongAttempts: encounter.wrongAttempts,
      })
    : null

  useEffect(() => {
    setHeardOnce(false)
    setPlayCount(encounter?.replayCount ?? 0)
    setReplayLine(null)
    return () => stopJapaneseSpeech()
  }, [encounter?.currentIndex, encounter?.replayCount, fragment?.id])

  async function playSignal() {
    if (!fragment || playCount >= maxReplays) return
    await tts.play(fragment.japanese, fragment.reading)
    if (!tts.error && encounter) {
      setHeardOnce(true)
      const { encounter: nextEncounter, replayLine: line } = recordListeningReplay(
        encounter,
        maxReplays,
        quest.id
      )
      setPlayCount(nextEncounter.replayCount ?? playCount + 1)
      setReplayLine(line)
    }
  }

  function stopSignal() {
    tts.stop()
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!answer.trim() || submitting || !heardOnce) return
    setSubmitting(true)
    try {
      await onSubmit(answer.trim())
      setAnswer("")
      setHeardOnce(false)
      setPlayCount(0)
      setReplayLine(null)
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
          {pressureLine && (
            <p className="mt-2 text-xs italic text-[var(--accent-bright)]">{pressureLine}</p>
          )}
          <ComboMeter streak={encounter?.correctStreak ?? 0} className="mt-2" />
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

      {focusMode && (
        <ListeningStationDisplay masked={!heardOnce && !tts.playing} />
      )}

      <div
        className={`rounded-[var(--radius-panel)] px-4 py-8 ${
          focusMode ? "" : "nozomi-signal-well"
        }`}
      >
        {!focusMode && (
          <AudioWaveform levels={tts.waveformLevels} active={tts.playing} className="mb-6" />
        )}
        <p className="text-center text-sm text-[var(--foreground)]">
          {tts.playing
            ? "Receiving signal…"
            : heardOnce
              ? "Signal logged. Transmit your decode."
              : "No glyph on screen — listen first."}
        </p>
        {replayLine && (
          <p className="mt-2 text-center text-xs text-[var(--warning)]">{replayLine}</p>
        )}
        {tts.error && (
          <p className="mt-2 text-center text-xs text-[var(--danger)]">{tts.error}</p>
        )}
        {!focusMode && (
          <div className="mt-6 flex flex-col items-center gap-3">
            {tts.playing ? (
              <Button type="button" size="md" variant="primary" onClick={stopSignal}>
                Tap to stop
              </Button>
            ) : (
              <Button
                type="button"
                size="md"
                disabled={
                  disabled || tts.playing || !tts.supported || playCount >= maxReplays
                }
                onClick={() => void playSignal()}
              >
                {heardOnce ? "Replay signal" : "Receive signal"}
              </Button>
            )}
          </div>
        )}
        {heardOnce && playsLeft > 0 && !focusMode && (
          <p className="mt-3 text-center text-xs text-[var(--muted)]">
            Plays remaining: {playsLeft}
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
          label={inputModeLabel(inputMode)}
          type="text"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={disabled || submitting || !heardOnce}
          placeholder={inputModePlaceholder(inputMode)}
          autoComplete="off"
        />
        <p className="text-xs text-[var(--danger)]">
          Signal errors remaining: {wrongLeft}
        </p>
        <div className="flex flex-col gap-3">
          <Button
            type="submit"
            size="md"
            disabled={disabled || submitting || !answer.trim() || !heardOnce}
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

  const wrapped = (
    <EncounterDisplayProvider
      quest={quest}
      player={player}
      promptDirection={fragment.promptDirection ?? "LISTEN_DECODE"}
      inputMode={inputMode}
      phase="ACTIVE"
    >
      {focusMode ? (
        <ListeningFocusShell
          onPlaySignal={() => void playSignal()}
          playing={tts.playing}
          disabled={disabled || playCount >= maxReplays || !tts.supported}
          subtitle={
            replayLine ??
            (heardOnce ? "Decode what you heard." : "Tap the mic to intercept the transmission.")
          }
        >
          {body}
        </ListeningFocusShell>
      ) : (
        <div className="mt-3">{body}</div>
      )}
    </EncounterDisplayProvider>
  )

  return wrapped
}
