"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useHunterSession } from "@/features/hunter/context/HunterSessionContext"
import { HunterPage } from "@/components/layout/HunterPage"
import { HunterPageBack } from "@/components/layout/HunterPageBack"
import { Button } from "@/components/ui/Button"
import { getCatalogEntryByEntSeq } from "@/systems/mastery/vocabularyCatalog"
import {
  loadWordMastery,
  markWordAsLearned,
} from "@/services/supabase/vocabularyRepository"
import { resolveVocabularyThreat, threatDisplayLabel } from "@/systems/vocabulary/vocabularyThreatSystem"
import { BREW_CONFIG } from "@/config/brewConfig"
import { LearnerWordLine } from "@/components/ui/LearnerWordLine"
import { learnerPartsFromCurated } from "@/services/jmdict/learnerFormat"
import { computeWordInstability, instabilityLabel } from "@/systems/vocabulary/memoryDecaySystem"
import type { WordMasteryContract } from "@/contracts/vocabulary-contract"
import { usePlayerStore } from "@/stores/usePlayerStore"
import { setMasteryPercent } from "@/systems/mastery/masterySystem"
import { refreshVocabularyPreparationForActiveQuests } from "@/systems/vocabulary/vocabularyPreparationOrchestrator"

interface WordDetailClientProps {
  entSeq: number
}

export function WordDetailClient({ entSeq }: WordDetailClientProps) {
  const { user } = useHunterSession()
  const player = usePlayerStore((s) => s.player)
  const activeQuests = usePlayerStore((s) => s.activeQuests)
  const setQuests = usePlayerStore((s) => s.setQuests)
  const entry = getCatalogEntryByEntSeq(entSeq)
  const [masteryRow, setMasteryRow] = useState<WordMasteryContract | undefined>()
  const [tab, setTab] = useState<"MEANING" | "USAGE">("MEANING")
  const [marking, setMarking] = useState(false)

  useEffect(() => {
    if (!user?.id) return
    void loadWordMastery(user.id).then((rows) => {
      const row = rows.find((r) => r.wordId === String(entSeq))
      setMasteryRow(row)
    })
  }, [user?.id, entSeq])

  if (!entry) {
    return (
      <HunterPage>
        <HunterPageBack href="/vocabulary" />
        <p className="text-[var(--muted)]">Entry not in registry.</p>
      </HunterPage>
    )
  }

  const threat = resolveVocabularyThreat(String(entSeq))
  const mastery = masteryRow?.mastery ?? 0
  const learned = mastery >= BREW_CONFIG.LEARNED_MASTERY_THRESHOLD
  const instability = computeWordInstability(masteryRow)
  const decayLabel = instabilityLabel(instability)
  const parts = learnerPartsFromCurated(entry)

  return (
    <HunterPage>
      <HunterPageBack href="/vocabulary" label="Threat index" />
      <div className="space-y-5 text-center">
        <LearnerWordLine parts={parts} layout="stacked" size="lg" audio className="justify-center" />
        <span className="inline-block rounded px-2 py-0.5 text-[10px] uppercase tracking-wider text-[var(--warning)]">
          {threatDisplayLabel(threat)}
        </span>
        {decayLabel && (
          <p className="text-[10px] uppercase tracking-wider text-[var(--danger)]">{decayLabel}</p>
        )}

        <div className="flex justify-center gap-4">
          {(["MEANING", "USAGE"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className={`text-xs uppercase tracking-widest ${
                tab === t ? "text-[var(--accent-bright)]" : "text-[var(--muted)]"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "MEANING" ? (
          <p className="text-lg text-[var(--foreground)]">{entry.meanings.join(", ")}</p>
        ) : (
          <p className="text-sm text-[var(--muted)]">
            {entry.japanese} ({entry.reading}) — used in sector encounters under system monitoring.
          </p>
        )}

        <p className="text-xs text-[var(--muted)]">
          Mastery: {mastery}% · {learned ? "Indexed as learned" : "Use Brew on the threat index to learn new words"}
        </p>

        {!learned && user?.id && (
          <>
            <Button
              variant="primary"
              size="md"
              className="w-full !py-3"
              disabled={marking}
              onClick={() => {
                setMarking(true)
                void markWordAsLearned(
                  user.id,
                  String(entSeq),
                  BREW_CONFIG.LEARNED_MASTERY_THRESHOLD
                )
                  .then(() =>
                    {
                      const nextMastery = setMasteryPercent(
                        String(entSeq),
                        BREW_CONFIG.LEARNED_MASTERY_THRESHOLD,
                        { correctCount: 1, wrongCount: 0 }
                      )
                      setMasteryRow(nextMastery)
                      if (player) {
                        setQuests(
                          refreshVocabularyPreparationForActiveQuests(activeQuests, {
                            playerId: user.id,
                            player,
                          })
                        )
                      }
                    }
                  )
                  .finally(() => setMarking(false))
              }}
            >
              {marking ? "Indexing…" : "Mark as learned"}
            </Button>
            <Link href="/vocabulary" className="block">
              <Button variant="ghost" size="md" className="mt-2 w-full !py-3">
                Brew from threat index
              </Button>
            </Link>
          </>
        )}
      </div>
    </HunterPage>
  )
}
