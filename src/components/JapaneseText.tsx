import {
  formatLearnerContent,
  pairJapanese,
} from "@/services/jmdict/readingAnnotation"

interface JapaneseTextProps {
  japanese: string
  /** Kana reading (reb); shown above romaji when present. */
  reading?: string
  romaji: string
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
}

const SIZE_CLASS = {
  sm: { jp: "text-sm", romaji: "text-xs" },
  md: { jp: "text-base", romaji: "text-sm" },
  lg: { jp: "text-4xl font-bold", romaji: "text-lg" },
  xl: { jp: "text-5xl font-bold", romaji: "text-xl" },
} as const

/** Always shows Japanese with romaji — never one without the other. */
export function JapaneseText({
  japanese,
  reading,
  romaji,
  size = "md",
  className = "",
}: JapaneseTextProps) {
  const sizes = SIZE_CLASS[size]
  const showKana = Boolean(reading?.trim())

  return (
    <span className={`inline-flex flex-col ${className}`}>
      <span className={`font-japanese ${sizes.jp} text-[var(--accent-bright)]`}>
        {japanese}
      </span>
      {showKana && (
        <span className={`font-japanese ${sizes.romaji} text-[var(--foreground)]/80`}>
          {reading}
        </span>
      )}
      <span className={`${sizes.romaji} text-[var(--muted)]`}>{romaji}</span>
    </span>
  )
}

/** Mixed English/Japanese copy with romaji inlined after each Japanese segment. */
export function LearnerMessageText({
  content,
  reading,
  className = "",
}: {
  content: string
  reading?: string
  className?: string
}) {
  return (
    <span className={className}>
      {formatLearnerContent(content, reading)}
    </span>
  )
}

export function JapaneseInline({
  japanese,
  romaji,
}: {
  japanese: string
  romaji: string
}) {
  return <span>{pairJapanese(japanese, romaji)}</span>
}
