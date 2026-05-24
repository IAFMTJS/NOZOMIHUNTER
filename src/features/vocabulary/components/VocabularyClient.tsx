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
import { JMDICT_CURATED } from "@/data/jmdictCurated"
import { loadWordMastery } from "@/services/supabase/vocabularyRepository"
import type { WordMasteryContract } from "@/contracts/vocabulary-contract"
import { brewWordGuarded } from "@/services/supabase/economyRepository"
import { canBrewWord, pickBrewCandidate, brewTokensAfterSpend } from "@/systems/vocabulary/brewSystem"
import {
  resolveVocabularyThreat,
  threatDisplayLabel,
} from "@/systems/vocabulary/vocabularyThreatSystem"
import { usePlayerStore } from "@/stores/usePlayerStore"
import { hydratePlayerFromDb } from "@/features/quests/services/questService"
import { BREW_CONFIG } from "@/config/brewConfig"
import { eventBus } from "@/systems/events/eventBus"
import { GAME_EVENTS } from "@/systems/events/eventTypes"

type Tab = "ALL" | "DETECTED" | "LEARNED"

export function VocabularyClient() {
  const searchParams = useSearchParams()
  const sessionMode = searchParams.get("session")
  const { player, user } = useHunterSession()
  const setPlayer = usePlayerStore((s) => s.setPlayer)
  const [tab, setTab] = useState<Tab>("ALL")
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
    return JMDICT_CURATED.map((e) => ({
      entSeq: e.entSeq,
      wordId: String(e.entSeq),
      kanji: e.japanese,
      romaji: e.reading,
      meaning: e.meanings[0] ?? "",
      mastery: known.get(String(e.entSeq))?.mastery ?? 0,
    }))
  }, [mastery])

  const filtered = useMemo(() => {
    if (tab === "LEARNED") {
      return entries.filter((e) => e.mastery >= BREW_CONFIG.LEARNED_MASTERY_THRESHOLD)
    }
    if (tab === "DETECTED") {
      return entries.filter(
        (e) => e.mastery > 0 && e.mastery < BREW_CONFIG.LEARNED_MASTERY_THRESHOLD
      )
    }
    return entries.slice(0, 80)
  }, [entries, tab])

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
        {(["ALL", "DETECTED", "LEARNED"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wider ${
              tab === t
                ? "bg-[var(--accent)]/30 text-[var(--accent-bright)]"
                : "text-[var(--muted)]"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <ul className="nozomi-embedded space-y-2 rounded-xl p-2 pb-20">
        {filtered.map((e) => (
          <li key={e.wordId}>
            <Link
              href={`/vocabulary/${e.entSeq}`}
              className="flex items-center justify-between rounded-xl border border-[var(--border-subtle)] bg-black/20 px-4 py-3"
            >
              <div>
                <p className="font-japanese text-lg text-[var(--foreground)]">{e.kanji}</p>
                <p className="text-xs text-[var(--muted)]">
                  {e.romaji} · {e.meaning}
                </p>
              </div>
              <span className="text-[10px] uppercase text-[var(--warning)]">
                THREAT · {threatDisplayLabel(resolveVocabularyThreat(e.wordId))}
              </span>
            </Link>
          </li>
        ))}
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
