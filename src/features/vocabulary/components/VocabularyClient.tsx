"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { useHunterSession } from "@/features/hunter/context/HunterSessionContext"
import { DungeonVocabLog } from "@/features/vocabulary/components/DungeonVocabLog"
import { loadCompletedQuestSnapshots } from "@/services/supabase/playerRepository"
import type { QuestContract } from "@/contracts/quest-contract"
import { HunterPage } from "@/components/layout/HunterPage"
import { Button } from "@/components/ui/Button"
import { LearnerWordLine } from "@/components/ui/LearnerWordLine"
import { JMDICT_CURATED } from "@/data/jmdictCurated"
import { loadWordMastery } from "@/services/supabase/vocabularyRepository"
import type { WordMasteryContract } from "@/contracts/vocabulary-contract"
import { brewWordGuarded } from "@/services/supabase/economyRepository"
import { canBrewWord, pickBrewCandidate, brewTokensAfterSpend } from "@/systems/vocabulary/brewSystem"
import {
  filterVocabularyCatalog,
  mapCuratedToCatalogEntry,
  type VocabularyCatalogTab,
} from "@/systems/vocabulary/vocabularyCatalogSystem"
import { threatDisplayLabel } from "@/systems/vocabulary/vocabularyThreatSystem"
import { instabilityLabel } from "@/systems/vocabulary/memoryDecaySystem"
import { learnerPartsFromCurated } from "@/services/jmdict/learnerFormat"
import { MasteryTierBadge } from "@/components/ui/screen/MasteryTierBadge"
import { masteryCardClass } from "@/systems/presentation/masteryPresentationSystem"
import { usePlayerStore } from "@/stores/usePlayerStore"
import { hydratePlayerFromDb } from "@/features/quests/services/questService"
import { BREW_CONFIG } from "@/config/brewConfig"
import { eventBus } from "@/systems/events/eventBus"
import { GAME_EVENTS } from "@/systems/events/eventTypes"

const TABS: { id: VocabularyCatalogTab; label: string }[] = [
  { id: "THREATS", label: "Threats" },
  { id: "CONQUERED", label: "Conquered" },
  { id: "ALL", label: "All" },
]

const THREAT_ROW_CLASS: Record<string, string> = {
  ROUTINE: "",
  ELEVATED: "border-[var(--warning)]/30",
  CRITICAL: "nozomi-threat-critical",
  SECTOR_CRITICAL: "nozomi-threat-sector-critical",
}

export function VocabularyClient() {
  const searchParams = useSearchParams()
  const sessionMode = searchParams.get("session")
  const { player, user } = useHunterSession()
  const setPlayer = usePlayerStore((s) => s.setPlayer)
  const [tab, setTab] = useState<VocabularyCatalogTab>("THREATS")
  const [mastery, setMastery] = useState<WordMasteryContract[]>([])
  const [busy, setBusy] = useState(false)
  const [lastRun, setLastRun] = useState<QuestContract | null>(null)

  useEffect(() => {
    if (user?.id) void loadWordMastery(user.id).then(setMastery)
  }, [user?.id])

  useEffect(() => {
    if (sessionMode !== "last" || !user?.id) return
    void loadCompletedQuestSnapshots(user.id, 1).then((quests) => {
      setLastRun(quests[0] ?? null)
    })
  }, [sessionMode, user?.id])

  const entries = useMemo(() => {
    const known = new Map(mastery.map((m) => [m.wordId, m]))
    const mapped = JMDICT_CURATED.map((e) =>
      mapCuratedToCatalogEntry(e, known.get(String(e.entSeq)))
    )
    return filterVocabularyCatalog(mapped, tab)
  }, [mastery, tab])

  async function handleBrew() {
    if (!player || !user?.id || !canBrewWord(player)) return
    const pick = pickBrewCandidate(mastery)
    if (!pick) return
    setBusy(true)
    try {
      await brewWordGuarded(pick.wordId)
      eventBus.emit(GAME_EVENTS.WORD_BREWED, {
        playerId: user.id,
        wordId: pick.wordId,
      })
      setPlayer(brewTokensAfterSpend(player))
      const next = await loadWordMastery(user.id)
      setMastery(next)
      await hydratePlayerFromDb(user.id)
    } finally {
      setBusy(false)
    }
  }

  if (!player) {
    return (
      <HunterPage>
        <p className="text-[var(--muted)]">Loading threat index…</p>
      </HunterPage>
    )
  }

  const dungeonWords =
    lastRun?.vocabularyEncounter?.words.map((w) => ({
      id: w.id,
      japanese: w.japanese,
      reading: w.reading,
      romaji: w.romaji,
      meaning: w.meanings[0] ?? "",
    })) ?? []

  return (
    <HunterPage>
      {sessionMode === "last" && dungeonWords.length > 0 && (
        <DungeonVocabLog
          dungeonName={lastRun?.title ?? "Last contract"}
          clearedAgoLabel="recently"
          words={dungeonWords}
        />
      )}

      <div className="nozomi-embedded mb-4 flex gap-2 rounded-xl p-3">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider ${
              tab === t.id
                ? "bg-[var(--accent)]/30 text-[var(--accent-bright)]"
                : "text-[var(--muted)]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <ul className="nozomi-embedded space-y-2 rounded-xl p-2 pb-20">
        {entries.length === 0 ? (
          <li className="px-4 py-6 text-center text-sm text-[var(--muted)]">
            {tab === "THREATS"
              ? "No active threats — stabilize words in contracts or training."
              : tab === "CONQUERED"
                ? "No conquered entries yet."
                : "Threat index empty."}
          </li>
        ) : (
          entries.map((e) => {
            const parts = learnerPartsFromCurated({
              entSeq: e.entSeq,
              japanese: [e.japanese],
              reading: [e.reading],
              romaji: e.romaji,
              meanings: [e.meaning],
            })
            const decay = instabilityLabel(e.instability)
            return (
              <li key={e.wordId}>
                <Link
                  href={`/vocabulary/${e.entSeq}`}
                  className={`${masteryCardClass(e.mastery)} flex items-center justify-between gap-3 rounded-xl border border-[var(--border-subtle)] bg-black/20 px-4 py-3 ${THREAT_ROW_CLASS[e.threat] ?? ""}`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <MasteryTierBadge masteryPercent={e.mastery} />
                    </div>
                    <LearnerWordLine parts={parts} layout="stacked" size="sm" audio />
                    {decay && (
                      <p className="mt-1 text-[10px] uppercase text-[var(--danger)]">
                        {decay}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 text-[10px] uppercase text-[var(--warning)]">
                    {threatDisplayLabel(e.threat)}
                  </span>
                </Link>
              </li>
            )
          })
        )}
      </ul>

      <div className="hunter-fab-above-nav fixed left-0 right-0 z-30 mx-auto max-w-lg px-4">
        <Button
          variant="primary"
          size="md"
          className="w-full !py-3"
          disabled={!canBrewWord(player) || busy}
          onClick={() => void handleBrew()}
        >
          Brew new word ({BREW_CONFIG.TOKEN_COST}) · {player.economy.brewTokens} tokens
        </Button>
      </div>
    </HunterPage>
  )
}
