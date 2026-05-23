"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useHunterSession } from "@/features/hunter/context/HunterSessionContext"
import { HunterPage } from "@/components/layout/HunterPage"
import { Button } from "@/components/ui/Button"
import { buildMissionCatalog } from "@/systems/quests/missionCatalogSystem"
import { StatusChip } from "@/components/ui/StatusChip"
import { loadCompletedQuestSnapshots } from "@/services/supabase/playerRepository"
import type { QuestContract } from "@/contracts/quest-contract"

export function ContractsClient() {
  const { user, player, regularQuests, quest } = useHunterSession()
  const [completedQuests, setCompletedQuests] = useState<QuestContract[]>([])

  useEffect(() => {
    if (!user?.id) return
    void loadCompletedQuestSnapshots(user.id).then(setCompletedQuests).catch(() => {
      setCompletedQuests([])
    })
  }, [user?.id, regularQuests.length])

  if (!player) {
    return (
      <HunterPage>
        <p className="text-[var(--muted)]">Loading contracts…</p>
      </HunterPage>
    )
  }

  const catalog = buildMissionCatalog(regularQuests, completedQuests.map((q) => q.id))

  return (
    <HunterPage>
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-[var(--muted)]">Contract dispatch</p>
          <Button variant="primary" size="sm" onClick={() => void quest.newQuest()} disabled={quest.busy}>
            Request contract
          </Button>
        </div>

        {catalog.mainStory && (
          <section>
            <p className="mb-2 font-display text-xs uppercase tracking-widest text-[var(--muted)]">
              Main story
            </p>
            <Link
              href={`/contracts/${catalog.mainStory.id}`}
              className="block rounded-2xl border border-[var(--accent)]/30 bg-gradient-to-br from-[var(--accent)]/15 to-transparent p-5"
            >
              <h2 className="font-display text-xl font-semibold text-[var(--foreground)]">
                {catalog.mainStory.title}
              </h2>
              <p className="mt-2 line-clamp-2 text-sm text-[var(--muted)]">
                {catalog.mainStory.description}
              </p>
              <p className="mt-3 text-xs text-[var(--accent-bright)]">
                {catalog.mainStory.objectives.filter((o) => o.completed).length}/
                {catalog.mainStory.objectives.length} objectives
              </p>
            </Link>
          </section>
        )}

        {catalog.sideQuests.length > 0 && (
          <section>
            <p className="mb-2 font-display text-xs uppercase tracking-widest text-[var(--muted)]">
              Side contracts
            </p>
            <ul className="space-y-2">
              {catalog.sideQuests.map((q) => (
                <li key={q.id}>
                  <Link
                    href={`/contracts/${q.id}`}
                    className="flex items-center justify-between rounded-xl border border-[var(--border-subtle)] bg-black/20 px-4 py-3"
                  >
                    <div>
                      <p className="font-medium text-[var(--foreground)]">{q.title}</p>
                      <p className="text-xs text-[var(--muted)]">{q.type}</p>
                    </div>
                    <StatusChip
                      label={`${q.objectives.filter((o) => o.completed).length}/${q.objectives.length}`}
                      tone="neutral"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {catalog.completed.length > 0 && (
          <section>
            <p className="mb-2 font-display text-xs uppercase tracking-widest text-[var(--muted)]">
              Completed
            </p>
            <ul className="space-y-2">
              {catalog.completed.map((q) => (
                <li
                  key={q.id}
                  className="rounded-xl border border-[var(--border-subtle)] bg-black/10 px-4 py-3 opacity-70"
                >
                  <p className="font-medium text-[var(--foreground)]">{q.title}</p>
                  <p className="text-xs text-[var(--success)]">Extracted</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {regularQuests.length === 0 && catalog.completed.length === 0 && (
          <p className="text-center text-sm text-[var(--muted)]">
            No active contracts. Request deployment from dispatch.
          </p>
        )}
      </div>
    </HunterPage>
  )
}
