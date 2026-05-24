"use client"

import { useState } from "react"
import { LearnerWordLine } from "@/components/ui/LearnerWordLine"
import { learnerPartsFromExtractionRow } from "@/services/jmdict/learnerFormat"
import { WordRarityChip } from "@/components/ui/screen/WordRarityChip"
import { wordRarityFromId } from "@/systems/presentation/wordRarityPresentation"

export interface WordExtractionRow {
  id: string
  japanese: string
  reading?: string
  romaji?: string
  meaning: string
  reviewed?: boolean
}

interface WordExtractionPanelProps {
  words: WordExtractionRow[]
  currentIndex: number
}

export function WordExtractionPanel({ words, currentIndex }: WordExtractionPanelProps) {
  const [tab, setTab] = useState<"new" | "reviewed">("new")

  const newWords = words.filter((_, i) => i >= currentIndex)
  const reviewed = words.filter((_, i) => i < currentIndex)
  const list = tab === "new" ? newWords : reviewed

  return (
    <div className="rounded-xl border border-[var(--border-subtle)] bg-black/20 p-3">
      <div className="mb-3 flex gap-1 rounded-lg border border-[var(--border-subtle)] bg-black/30 p-1">
        {(
          [
            { id: "new" as const, label: `New Words (${newWords.length})` },
            { id: "reviewed" as const, label: `Reviewed (${reviewed.length})` },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`flex-1 rounded-md px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wider ${
              tab === t.id
                ? "bg-[var(--accent)]/25 text-[var(--accent-bright)]"
                : "text-[var(--muted)]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <ul className="max-h-40 space-y-2 overflow-y-auto">
        {list.length === 0 ? (
          <li className="text-center text-xs text-[var(--muted)]">No entries.</li>
        ) : (
          list.map((w, i) => {
            const globalIndex = tab === "new" ? currentIndex + i : i
            const isCurrent = tab === "new" && globalIndex === currentIndex
            const masked = tab === "new" && !isCurrent && globalIndex >= currentIndex

            return (
              <li
                key={w.id}
                className="flex items-center gap-2 border-b border-[var(--border-subtle)]/50 pb-2 last:border-0"
              >
                <div className="min-w-0 flex-1">
                  {masked ? (
                    <p className="nozomi-mask-glitch text-xs text-[var(--muted)]">
                      ███ encrypted signature · sector {globalIndex + 1}
                    </p>
                  ) : isCurrent ? (
                    <p className="nozomi-mask-static text-xs text-[var(--accent-bright)]">
                      ░░ target locked — decode to extract
                    </p>
                  ) : (
                    <LearnerWordLine
                      parts={learnerPartsFromExtractionRow(w)}
                      layout="stacked"
                      size="sm"
                      audio
                      forceReveal
                    />
                  )}
                </div>
                <WordRarityChip tier={wordRarityFromId(w.id)} />
              </li>
            )
          })
        )}
      </ul>
    </div>
  )
}
