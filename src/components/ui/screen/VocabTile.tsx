import { JapaneseText } from "@/components/JapaneseText"

interface VocabTileProps {
  kanji: string
  romaji: string
  meaning: string
  threatLevel?: string
}

export function VocabTile({ kanji, romaji, meaning, threatLevel }: VocabTileProps) {
  const elevated =
    threatLevel === "CRITICAL" || threatLevel === "SECTOR_CRITICAL"

  return (
    <div
      className={`nozomi-glass-card flex flex-col items-center rounded-lg p-3 text-center ${
        elevated ? "nozomi-glass-card-accent" : ""
      }`}
    >
      <JapaneseText japanese={kanji} romaji={romaji} size="sm" />
      <p className="mt-2 line-clamp-2 text-xs text-[var(--foreground)]">
        {meaning}
      </p>
    </div>
  )
}
