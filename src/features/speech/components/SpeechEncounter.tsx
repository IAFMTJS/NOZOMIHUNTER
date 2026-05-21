"use client"

import { useEffect, useRef, useState } from "react"
import type { QuestContract } from "@/contracts/quest-contract"
import { getCurrentPhrase } from "@/systems/quests/speechEncounterSystem"
import { getQuestBriefing } from "@/systems/quests/questGenerator"
import { SPEECH_ENCOUNTER_CONFIG } from "@/config/speechEncounterConfig"
import { JapaneseText } from "@/components/JapaneseText"
import { useBrowserSpeech } from "@/hooks/useBrowserSpeech"

interface SpeechEncounterProps {
  quest: QuestContract
  disabled?: boolean
  onSubmit: (transcript: string, responseTimeMs: number) => Promise<void>
  onAbandon: () => Promise<void>
}

export function SpeechEncounter({
  quest,
  disabled,
  onSubmit,
  onAbandon,
}: SpeechEncounterProps) {
  const [typed, setTyped] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const phaseStartRef = useRef(Date.now())
  const speech = useBrowserSpeech("en-US")

  useEffect(() => {
    if (speech.listening && speech.transcript) {
      setTyped(speech.transcript)
    }
  }, [speech.listening, speech.transcript])

  const encounter = quest.speechEncounter
  const phrase = encounter ? getCurrentPhrase(encounter) : null
  const objective = quest.objectives[0]
  const briefing = getQuestBriefing(quest)
  const wrongLeft = encounter
    ? Math.max(
        0,
        SPEECH_ENCOUNTER_CONFIG.MAX_WRONG_ATTEMPTS - encounter.wrongAttempts
      )
    : 0

  async function transmit(transcript: string, responseTimeMs: number) {
    if (!transcript.trim() || submitting) return
    setSubmitting(true)
    try {
      await onSubmit(transcript.trim(), responseTimeMs)
      setTyped("")
      speech.clearTranscript()
      phaseStartRef.current = Date.now()
    } finally {
      setSubmitting(false)
    }
  }

  async function handleTypedSubmit(e: React.FormEvent) {
    e.preventDefault()
    const ms = Math.max(0, Date.now() - phaseStartRef.current)
    await transmit(typed, ms)
  }

  async function handleMicToggle() {
    if (speech.listening) {
      const heard = await speech.stopAndGetTranscript()
      const ms =
        speech.getResponseTimeMs() ||
        Math.max(0, Date.now() - phaseStartRef.current)
      if (heard.trim()) {
        await transmit(heard, ms)
      }
      return
    }
    phaseStartRef.current = Date.now()
    await speech.start()
  }

  async function handleVoiceSubmit() {
    const heard = speech.listening
      ? await speech.stopAndGetTranscript()
      : speech.transcript
    const transcript = heard.trim() || typed.trim()
    const ms =
      speech.getResponseTimeMs() ||
      Math.max(0, Date.now() - phaseStartRef.current)
    await transmit(transcript, ms)
  }

  if (!encounter?.phrases.length) {
    return (
      <p className="mt-3 text-sm text-[var(--danger)]">
        Speech encounter data missing. Refresh the dashboard.
      </p>
    )
  }

  const displayTranscript = speech.transcript || typed

  return (
    <div className="mt-3 rounded border border-white/10 bg-black/20 p-4">
      {briefing && (
        <p className="mb-3 text-sm italic text-[var(--muted)]">{briefing}</p>
      )}

      <div className="mb-4 flex flex-wrap gap-2">
        {encounter.phrases.map((p, i) => {
          const done = i < encounter.currentIndex
          const current = i === encounter.currentIndex
          return (
            <span
              key={p.id}
              className={`inline-flex flex-col rounded px-2 py-1 text-xs ${
                done
                  ? "bg-[var(--accent)]/20 text-[var(--accent)]"
                  : current
                    ? "border border-[var(--accent)] text-[var(--accent)]"
                    : "border border-white/10 text-[var(--muted)]"
              }`}
            >
              {done || current ? (
                <JapaneseText
                  japanese={p.japanese}
                  reading={p.reading}
                  romaji={p.romaji}
                  size="sm"
                />
              ) : (
                <span>？</span>
              )}
            </span>
          )
        })}
      </div>

      {phrase ? (
        <>
          <p className="mb-1 text-xs uppercase tracking-wide text-[var(--muted)]">
            Transmit {encounter.currentIndex + 1} / {encounter.phrases.length}
          </p>
          <div className="mb-4">
            <JapaneseText
              japanese={phrase.japanese}
              reading={phrase.reading}
              romaji={phrase.romaji}
              size="lg"
            />
          </div>

          {speech.supported ? (
            <div className="mb-3 flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-[var(--muted)]">Recognition:</span>
                <button
                  type="button"
                  disabled={disabled || submitting || speech.listening}
                  onClick={() => speech.setLang("en-US")}
                  className={`rounded px-2 py-0.5 text-xs ${
                    speech.lang === "en-US"
                      ? "bg-[var(--accent)] text-black"
                      : "border border-white/20 text-[var(--muted)]"
                  }`}
                >
                  Romaji (en)
                </button>
                <button
                  type="button"
                  disabled={disabled || submitting || speech.listening}
                  onClick={() => speech.setLang("ja-JP")}
                  className={`rounded px-2 py-0.5 text-xs ${
                    speech.lang === "ja-JP"
                      ? "bg-[var(--accent)] text-black"
                      : "border border-white/20 text-[var(--muted)]"
                  }`}
                >
                  Japanese
                </button>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={disabled || submitting}
                  onClick={handleMicToggle}
                  className={`rounded border px-3 py-1 text-sm disabled:opacity-50 ${
                    speech.listening
                      ? "border-[var(--danger)] text-[var(--danger)] animate-pulse"
                      : "border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-black"
                  }`}
                >
                  {speech.listening ? "Stop & send" : "Record (mic)"}
                </button>
                {!speech.listening && displayTranscript.trim() && (
                  <button
                    type="button"
                    disabled={disabled || submitting}
                    onClick={handleVoiceSubmit}
                    className="rounded border border-white/20 px-3 py-1 text-sm hover:bg-white/10 disabled:opacity-50"
                  >
                    Send again
                  </button>
                )}
              </div>

              {(speech.listening || speech.micReady) && (
                <div className="flex items-center gap-2">
                  <div className="h-2 flex-1 overflow-hidden rounded bg-white/10">
                    <div
                      className="h-full bg-[var(--accent)] transition-all duration-75"
                      style={{
                        width: `${Math.min(100, Math.round(speech.micLevel * 100))}%`,
                      }}
                    />
                  </div>
                  <span className="text-[10px] text-[var(--muted)]">
                    {speech.listening ? "input level" : "mic ready"}
                  </span>
                </div>
              )}

              <p className="text-xs text-[var(--muted)]">
                {speech.listening
                  ? `Speak the ${speech.lang === "ja-JP" ? "Japanese" : "romaji"} line, then Stop & send. Needs Chrome/Edge + internet.`
                  : "Default Romaji (en) — switch to Japanese if speaking native audio."}
              </p>
            </div>
          ) : (
            <p className="mb-3 text-xs text-[var(--muted)]">
              Voice capture unavailable — use Chrome or Edge on HTTPS/localhost, or
              type your line below.
            </p>
          )}

          {speech.error && (
            <p className="mb-2 text-xs text-[var(--danger)]">{speech.error}</p>
          )}

          {speech.listening && !displayTranscript.trim() && (
            <p className="mb-3 text-xs text-[var(--muted)]">
              Listening… if the level bar stays flat, check Windows mic input device.
            </p>
          )}

          {displayTranscript && (
            <p className="mb-3 rounded bg-black/30 p-2 text-sm text-[var(--foreground)]">
              Heard: {displayTranscript}
            </p>
          )}

          <form onSubmit={handleTypedSubmit} className="flex flex-col gap-3">
            <label className="text-sm text-[var(--muted)]">
              Typed fallback (romaji or Japanese)
              <input
                type="text"
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                disabled={disabled || submitting}
                className="mt-1 w-full rounded border border-white/20 bg-black/30 px-3 py-2 text-[var(--foreground)]"
                placeholder="e.g. mizu"
                autoComplete="off"
              />
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="submit"
                disabled={disabled || submitting || !typed.trim()}
                className="rounded border border-[var(--accent)] px-3 py-1 text-sm text-[var(--accent)] hover:bg-[var(--accent)] hover:text-black disabled:opacity-50"
              >
                {submitting ? "Analyzing..." : "Transmit (typed)"}
              </button>
              <button
                type="button"
                disabled={disabled || submitting}
                onClick={onAbandon}
                className="rounded border border-white/20 px-3 py-1 text-sm text-[var(--muted)] hover:bg-white/10 disabled:opacity-50"
              >
                Abandon
              </button>
            </div>
          </form>

          {objective && (
            <p className="mt-3 text-sm text-[var(--muted)]">
              Cleared: {objective.currentProgress}/{objective.requiredProgress}
              · Failed transmissions remaining: {wrongLeft}
            </p>
          )}
        </>
      ) : (
        <p className="text-sm text-[var(--muted)]">
          All phrases transmitted. Complete the contract to claim XP.
        </p>
      )}
    </div>
  )
}
