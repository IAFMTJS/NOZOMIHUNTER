"use client"

import Link from "next/link"
import { JapaneseText } from "@/components/JapaneseText"
import { Button } from "@/components/ui/Button"
import { WordRarityChip } from "@/components/ui/screen/WordRarityChip"
import { wordRarityFromId } from "@/systems/presentation/wordRarityPresentation"

export interface DungeonVocabLogWord {
  id: string
  japanese: string
  reading?: string
  romaji?: string
  meaning: string
}

interface DungeonVocabLogProps {
  dungeonName: string
  clearedAgoLabel: string
  words: DungeonVocabLogWord[]
}

export function DungeonVocabLog({
  dungeonName,
  clearedAgoLabel,
  words,
}: DungeonVocabLogProps) {
  return (
    <div className="nozomi-embedded space-y-4 rounded-2xl p-4">
      <div>
        <p className="font-display text-lg font-semibold text-[var(--foreground)]">
          {dungeonName}
        </p>
        <p className="text-xs text-[var(--muted)]">Cleared {clearedAgoLabel}</p>
      </div>
      <ul className="max-h-64 space-y-3 overflow-y-auto">
        {words.map((w) => (
          <li key={w.id} className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <JapaneseText
                japanese={w.japanese}
                reading={w.reading}
                romaji={w.romaji ?? ""}
                size="sm"
              />
              <p className="text-xs text-[var(--muted)]">{w.meaning}</p>
            </div>
            <WordRarityChip tier={wordRarityFromId(w.id)} />
          </li>
        ))}
      </ul>
      <Link href="/vocabulary">
        <Button variant="cta" size="md" className="w-full !py-3">
          Start review
        </Button>
      </Link>
    </div>
  )
}
