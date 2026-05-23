"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useHunterSession } from "@/features/hunter/context/HunterSessionContext"
import { HunterPage } from "@/components/layout/HunterPage"
import { HunterPageBack } from "@/components/layout/HunterPageBack"
import { Button } from "@/components/ui/Button"
import { JMDICT_CURATED } from "@/data/jmdictCurated"
import { loadWordMastery } from "@/services/supabase/vocabularyRepository"
import { resolveVocabularyThreat, threatDisplayLabel } from "@/systems/vocabulary/vocabularyThreatSystem"
import { BREW_CONFIG } from "@/config/brewConfig"

interface WordDetailClientProps {
  entSeq: number
}

export function WordDetailClient({ entSeq }: WordDetailClientProps) {
  const { user } = useHunterSession()
  const entry = JMDICT_CURATED.find((e) => e.entSeq === entSeq)
  const [mastery, setMastery] = useState(0)
  const [tab, setTab] = useState<"MEANING" | "USAGE">("MEANING")

  useEffect(() => {
    if (!user?.id) return
    void loadWordMastery(user.id).then((rows) => {
      const row = rows.find((r) => r.wordId === String(entSeq))
      setMastery(row?.mastery ?? 0)
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
  const learned = mastery >= BREW_CONFIG.LEARNED_MASTERY_THRESHOLD

  return (
    <HunterPage>
      <HunterPageBack href="/vocabulary" label="Threat index" />
      <div className="space-y-5 text-center">
        <p className="font-japanese text-5xl text-[var(--foreground)]">{entry.japanese}</p>
        <p className="text-[var(--muted)]">{entry.reading}</p>
        <span className="inline-block rounded px-2 py-0.5 text-[10px] uppercase tracking-wider text-[var(--warning)]">
          {threatDisplayLabel(threat)}
        </span>

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

        {!learned && (
          <Link href="/vocabulary">
            <Button variant="primary" size="md" className="w-full !py-3">
              Brew from threat index
            </Button>
          </Link>
        )}
      </div>
    </HunterPage>
  )
}
