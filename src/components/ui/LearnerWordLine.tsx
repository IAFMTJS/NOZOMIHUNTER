"use client"

import type { LearnerWordParts } from "@/services/jmdict/learnerFormat"
import { WordAudioButton } from "@/components/ui/WordAudioButton"
import { useChallengeDisplay } from "@/context/encounters/LearnerAssistContext"
import { resolveVisibleLayers } from "@/systems/learning/challengeDisplaySystem"
import { mergeVisibleLayers } from "@/systems/hints/hintSystem"
import { useEncounterHintOptional } from "@/context/encounters/EncounterHintContext"

interface LearnerWordLineProps {
  parts: LearnerWordParts
  layout?: "compact" | "stacked"
  size?: "sm" | "md" | "lg"
  audio?: boolean
  className?: string
  forceReveal?: boolean
}

export function LearnerWordLine({
  parts,
  layout = "compact",
  size = "md",
  audio = false,
  className = "",
  forceReveal = false,
}: LearnerWordLineProps) {
  const ctx = useChallengeDisplay()
  const hint = useEncounterHintOptional()
  const phase = forceReveal ? "REVEALED" : ctx.phase
  const baseLayers = resolveVisibleLayers(
    ctx.promptDirection,
    phase,
    ctx.assistLevel,
    ctx.challengeMode && !forceReveal
  )
  const layers =
    hint?.visionActive && hint.visionLayers && phase === "ACTIVE" && !forceReveal
      ? mergeVisibleLayers(baseLayers, hint.visionLayers)
      : baseLayers

  const jpSize =
    size === "lg" ? "text-2xl" : size === "sm" ? "text-base" : "text-lg"
  const revealClass =
    phase === "REVEALED" && ctx.challengeMode
      ? "nozomi-mask-reveal"
      : hint?.visionActive
        ? "nozomi-hunter-vision-reveal"
        : ""

  if (layout === "compact") {
    const segments: string[] = []
    if (layers.japanese) segments.push(parts.japanese)
    if (layers.reading && parts.reading) segments.push(parts.reading)
    if (layers.romaji) segments.push(parts.romaji)
    if (layers.meaning) segments.push(parts.meaning)
    const text = segments.length > 0 ? segments.join(" • ") : "███"

    return (
      <div className={`flex items-start gap-2 ${className} ${revealClass}`}>
        <p className={`font-japanese ${jpSize} text-[var(--foreground)]`}>
          {text}
        </p>
        {audio && layers.japanese && (
          <WordAudioButton japanese={parts.japanese} reading={parts.reading} />
        )}
      </div>
    )
  }

  return (
    <div className={`space-y-0.5 ${className} ${revealClass}`}>
      {layers.japanese ? (
        <div className="flex items-center gap-2">
          <p className={`font-japanese ${jpSize} text-[var(--foreground)]`}>
            {parts.japanese}
          </p>
          {audio && (
            <WordAudioButton japanese={parts.japanese} reading={parts.reading} />
          )}
        </div>
      ) : (
        !layers.meaning && (
          <p className={`nozomi-mask-glitch ${jpSize} font-display text-[var(--muted)]`}>
            ███
          </p>
        )
      )}
      {layers.reading && (
        <p className="text-xs text-[var(--muted)]">{parts.reading}</p>
      )}
      {layers.romaji && (
        <p className="text-xs text-[var(--muted)]">{parts.romaji}</p>
      )}
      {layers.meaning && (
        <p className="text-sm text-[var(--foreground)]">{parts.meaning}</p>
      )}
    </div>
  )
}
