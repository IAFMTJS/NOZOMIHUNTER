"use client"

import type { LearnerWordParts } from "@/services/jmdict/learnerFormat"
import { formatLearnerTriple } from "@/services/jmdict/learnerFormat"
import { WordAudioButton } from "@/components/ui/WordAudioButton"
import { useLearnerAssist } from "@/features/encounters/context/LearnerAssistContext"

interface LearnerWordLineProps {
  parts: LearnerWordParts
  layout?: "compact" | "stacked"
  size?: "sm" | "md" | "lg"
  audio?: boolean
  className?: string
}

export function LearnerWordLine({
  parts,
  layout = "compact",
  size = "md",
  audio = false,
  className = "",
}: LearnerWordLineProps) {
  const assist = useLearnerAssist()
  const blackout = assist === "BLACKOUT"
  const jpSize =
    size === "lg" ? "text-2xl" : size === "sm" ? "text-base" : "text-lg"

  if (layout === "compact") {
    return (
      <div className={`flex items-start gap-2 ${className}`}>
        <p className={`font-japanese ${jpSize} text-[var(--foreground)]`}>
          {blackout ? parts.japanese : formatLearnerTriple(parts)}
        </p>
        {audio && (
          <WordAudioButton japanese={parts.japanese} reading={parts.reading} />
        )}
      </div>
    )
  }

  return (
    <div className={`space-y-0.5 ${className}`}>
      <div className="flex items-center gap-2">
        <p className={`font-japanese ${jpSize} text-[var(--foreground)]`}>
          {parts.japanese}
        </p>
        {audio && (
          <WordAudioButton japanese={parts.japanese} reading={parts.reading} />
        )}
      </div>
      {!blackout && (
        <>
          <p className="text-xs text-[var(--muted)]">{parts.reading}</p>
          <p className="text-xs text-[var(--muted)]">{parts.romaji}</p>
          <p className="text-sm text-[var(--foreground)]">{parts.meaning}</p>
        </>
      )}
    </div>
  )
}
