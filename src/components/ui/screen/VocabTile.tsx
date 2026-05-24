import { JapaneseText } from "@/components/JapaneseText"
import { WordAudioButton } from "@/components/ui/WordAudioButton"

interface VocabTileProps {
  kanji: string
  romaji: string
  meaning: string
  reading?: string
  threatLevel?: string
  audio?: boolean
}

export function VocabTile({
  kanji,
  romaji,
  meaning,
  reading,
  threatLevel,
  audio = true,
}: VocabTileProps) {
  const elevated =
    threatLevel === "CRITICAL" || threatLevel === "SECTOR_CRITICAL"

  return (
    <div
      className={`nozomi-glass-card flex flex-col items-center rounded-lg p-3 text-center ${
        elevated ? "nozomi-glass-card-accent" : ""
      }`}
    >
      <div className="flex items-center gap-1">
        <JapaneseText japanese={kanji} reading={reading} romaji={romaji} size="sm" />
        {audio && <WordAudioButton japanese={kanji} reading={reading} />}
      </div>
      <p className="mt-2 line-clamp-2 text-xs text-[var(--foreground)]">
        {meaning}
      </p>
    </div>
  )
}
