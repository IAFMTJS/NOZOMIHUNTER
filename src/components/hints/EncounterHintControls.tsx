"use client"

import { Button } from "@/components/ui/Button"
import { useEncounterHint } from "@/features/encounters/context/EncounterHintContext"
import { CompanionWhisperLine } from "@/components/hints/CompanionWhisperLine"
import { HunterVisionControl } from "@/components/hints/HunterVisionControl"

interface EncounterHintControlsProps {
  className?: string
}

export function EncounterHintControls({ className = "" }: EncounterHintControlsProps) {
  const { whisper, limits, requestWhisper, radicalNote, visionActive } = useEncounterHint()

  const whisperDisabled =
    limits.whispersBlocked || limits.whispersRemaining <= 0

  return (
    <div className={`space-y-3 ${className}`}>
      <CompanionWhisperLine whisper={whisper} />
      {visionActive && radicalNote && (
        <p className="text-center text-[10px] uppercase tracking-wider text-[var(--warning)]">
          {radicalNote}
        </p>
      )}
      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <HunterVisionControl />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={whisperDisabled}
          onClick={requestWhisper}
          className="text-xs uppercase tracking-wider"
        >
          {limits.whispersBlocked
            ? "Whispers offline"
            : `Companion whisper (${limits.whispersRemaining})`}
        </Button>
      </div>
    </div>
  )
}
