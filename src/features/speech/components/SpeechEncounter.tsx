"use client"

import { useEffect } from "react"
import type { QuestContract } from "@/contracts/quest-contract"
import { RECORDING_STATES } from "@/systems/speech/recordingStateTypes"
import { getCurrentPhrase } from "@/systems/quests/speechEncounterSystem"
import { getQuestBriefing } from "@/systems/quests/questGenerator"
import { SPEECH_ENCOUNTER_CONFIG } from "@/config/speechEncounterConfig"
import { JapaneseText } from "@/components/JapaneseText"
import { Panel } from "@/components/ui/Panel"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { EncounterTargetRail } from "@/components/ui/EncounterTargetRail"
import { useSpeechEncounterController } from "@/features/speech/hooks/useSpeechEncounterController"

interface SpeechEncounterProps {
  quest: QuestContract
  disabled?: boolean
  onSubmit: (transcript: string, responseTimeMs: number) => Promise<void>
  onAbandon: () => Promise<void>
  hideLegacyBriefing?: boolean
}

function statusLabel(state: string, transcriptionStatus: string): string {
  switch (state) {
    case RECORDING_STATES.REQUESTING_PERMISSION:
      return "Requesting microphone…"
    case RECORDING_STATES.RECORDING:
      return "Recording — speak your line"
    case RECORDING_STATES.PROCESSING:
      if (transcriptionStatus === "processing") return "Processing speech…"
      return "Processing transmission…"
    case RECORDING_STATES.ERROR:
      return "Transmission failed"
    case RECORDING_STATES.COMPLETED:
      return "Transmission ready"
    default:
      return "Stand by — mic idle"
  }
}

export function SpeechEncounter({
  quest,
  disabled,
  onSubmit,
  onAbandon,
  hideLegacyBriefing = false,
}: SpeechEncounterProps) {
  const {
    speech,
    typed,
    setTyped,
    submitting,
    busy,
    handleTypedSubmit,
    handleMicToggle,
    displayTranscript,
  } = useSpeechEncounterController({ disabled, onSubmit })

  useEffect(() => {
    if (speech.recording && speech.transcript) {
      setTyped(speech.transcript)
    }
  }, [speech.recording, speech.transcript, setTyped])

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

  if (!encounter?.phrases.length) {
    return (
      <p className="mt-3 text-sm text-[var(--danger)]">
        Speech encounter data missing. Re-link hunter status.
      </p>
    )
  }

  const status = statusLabel(speech.state, speech.transcriptionStatus)

  return (
    <Panel tone="inset" className="mt-3">
      {briefing && !hideLegacyBriefing && (
        <p className="mb-3 text-sm italic text-[var(--muted)]">{briefing}</p>
      )}

      <EncounterTargetRail
        items={encounter.phrases.map((p, i) => {
          const done = i < encounter.currentIndex
          const current = i === encounter.currentIndex
          return {
            id: p.id,
            state: done ? "done" : current ? "current" : "hidden",
            content: (
              <JapaneseText
                japanese={p.japanese}
                reading={p.reading}
                romaji={p.romaji}
                size="sm"
              />
            ),
          }
        })}
      />

      {phrase ? (
        <>
          <p className="mb-1 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
            Voice channel · Transmit {encounter.currentIndex + 1} /{" "}
            {encounter.phrases.length}
          </p>
          <div className="mb-6 rounded-lg border border-[var(--border-accent)] bg-[var(--accent-dim)] px-4 py-6 text-center">
            <JapaneseText
              japanese={phrase.japanese}
              reading={phrase.reading}
              romaji={phrase.romaji}
              size="lg"
            />
          </div>

          <p
            className={`mb-3 text-xs uppercase tracking-wide ${
              speech.state === RECORDING_STATES.ERROR
                ? "text-[var(--danger)]"
                : speech.recording
                  ? "text-[var(--accent)]"
                  : "text-[var(--muted)]"
            }`}
            aria-live="polite"
          >
            {status}
          </p>

          <div className="mb-4 flex flex-col gap-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
              <span className="text-xs text-[var(--muted)]">Recognition</span>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="md"
                  variant={speech.lang === "en-US" ? "primary" : "ghost"}
                  disabled={busy || !speech.supported}
                  onClick={() => speech.setLang("en-US")}
                >
                  Romaji (en)
                </Button>
                <Button
                  type="button"
                  size="md"
                  variant={speech.lang === "ja-JP" ? "primary" : "ghost"}
                  disabled={busy || !speech.supported}
                  onClick={() => speech.setLang("ja-JP")}
                >
                  Japanese
                </Button>
              </div>
            </div>

            <Button
              type="button"
              size="md"
              variant={speech.recording ? "danger" : "primary"}
              disabled={!speech.supported || (busy && !speech.recording)}
              onClick={handleMicToggle}
              className={`w-full sm:w-auto ${
                speech.recording ? "animate-pulse" : ""
              }`}
            >
              {speech.recording
                ? "Stop & transmit"
                : speech.processing
                  ? "Processing…"
                  : "Transmit (voice)"}
            </Button>

            {(speech.recording || speech.micReady) && speech.supported && (
              <div className="flex items-center gap-2">
                <div className="h-2.5 min-h-[10px] flex-1 overflow-hidden rounded bg-[var(--surface-2)]">
                  <div
                    className="h-full bg-[var(--accent)] transition-all duration-75"
                    style={{
                      width: `${Math.min(100, Math.round(speech.micLevel * 100))}%`,
                    }}
                  />
                </div>
                <span className="shrink-0 text-[10px] text-[var(--muted)]">
                  {speech.recording ? "input level" : "mic ready"}
                </span>
              </div>
            )}

            <p className="text-xs leading-relaxed text-[var(--muted)]">
              {!speech.supported
                ? speech.micAccessHint ||
                  "Voice capture is not available. Use typed fallback below."
                : speech.recording
                  ? `Speak the ${speech.lang === "ja-JP" ? "Japanese" : "romaji"} line, then Stop & send.`
                  : speech.browserSttSupported
                    ? "Browser speech recognition (Chrome/Edge). Typed fallback always available."
                    : "MediaRecorder capture — typed fallback always available."}
            </p>
          </div>

          {speech.error && (
            <p className="mb-3 text-xs text-[var(--danger)]">{speech.error}</p>
          )}

          {speech.recording && !displayTranscript.trim() && (
            <p className="mb-3 text-xs text-[var(--muted)]">
              Listening… if the level bar stays flat, check your mic input
              device.
            </p>
          )}

          {displayTranscript && (
            <Panel tone="inset" className="mb-4 !p-3">
              <p className="text-sm text-[var(--foreground)]">
                Heard: {displayTranscript}
              </p>
            </Panel>
          )}

          <form onSubmit={handleTypedSubmit} className="flex flex-col gap-3">
            <Input
              label="Typed fallback (romaji or Japanese)"
              type="text"
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              disabled={busy}
              placeholder="e.g. mizu"
              autoComplete="off"
            />
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <Button
                type="submit"
                size="md"
                disabled={busy || !typed.trim()}
                className="w-full sm:w-auto"
              >
                {submitting ? "Analyzing…" : "Transmit (typed)"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="md"
                disabled={busy}
                onClick={onAbandon}
                className="w-full sm:w-auto"
              >
                Abort contract
              </Button>
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
    </Panel>
  )
}
