"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useHunterSession } from "@/features/hunter/context/HunterSessionContext"
import { HunterPage } from "@/components/layout/HunterPage"
import { Button } from "@/components/ui/Button"
import { TabBar } from "@/components/ui/TabBar"
import { QuestListCard } from "@/components/ui/screen/QuestListCard"
import { HeroBanner } from "@/components/ui/screen/HeroBanner"
import { ContractTypeIcon } from "@/components/ui/screen/ContractTypeIcon"
import { GlassCard } from "@/components/ui/GlassCard"
import { buildContractCatalog } from "@/systems/quests/contractCatalogSystem"
import { aggregateQuestProgress } from "@/systems/presentation/questPresentationSystem"
import { resolveAchievements } from "@/systems/progression/achievementSystem"
import { loadCompletedQuestSnapshots } from "@/services/supabase/playerRepository"
import type { QuestContract } from "@/contracts/quest-contract"

type ContractTab = "daily" | "weekly" | "achievements"

const TABS: { id: ContractTab; label: string }[] = [
  { id: "daily", label: "Daily" },
  { id: "weekly", label: "Weekly" },
  { id: "achievements", label: "Achievements" },
]

export function ContractsClient() {
  const { user, player, regularQuests, quest } = useHunterSession()
  const [completedQuests, setCompletedQuests] = useState<QuestContract[]>([])
  const [tab, setTab] = useState<ContractTab>("daily")

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

  const catalog = buildContractCatalog(
    regularQuests,
    completedQuests.map((q) => q.id)
  )
  const achievements = resolveAchievements(player)

  return (
    <HunterPage>
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm text-[var(--muted)]">
            Missions · contract dispatch
          </p>
          <Button variant="ghost" size="sm" onClick={() => void quest.newQuest()} disabled={quest.busy}>
            Request
          </Button>
        </div>

        <TabBar tabs={TABS} active={tab} onChange={setTab} />

        {tab === "daily" && (
          <ul className="space-y-3">
            {catalog.sideQuests.length === 0 ? (
              <p className="text-center text-sm text-[var(--muted)]">
                No daily contracts. Request deployment from dispatch.
              </p>
            ) : (
              catalog.sideQuests.map((q) => {
                const prog = aggregateQuestProgress(q)
                return (
                  <li key={q.id} className="flex items-stretch gap-2">
                    <ContractTypeIcon type={q.type} />
                    <div className="min-w-0 flex-1">
                      <QuestListCard
                        title={q.title}
                        progressCurrent={prog.current}
                        progressRequired={prog.required}
                        rewardXp={q.rewards.xp}
                        href={`/contracts/${q.id}`}
                        completed={prog.complete}
                      />
                    </div>
                  </li>
                )
              })
            )}
          </ul>
        )}

        {tab === "weekly" && (
          <div className="space-y-4">
            {catalog.mainStory ? (
              <>
                <Link href={`/contracts/${catalog.mainStory.id}`} className="block space-y-3">
                  <HeroBanner title={catalog.mainStory.title} tall />
                  <GlassCard tone="accent" className="transition-opacity hover:opacity-90">
                    <p className="text-[10px] uppercase tracking-widest text-[var(--accent-bright)]">
                      Main story
                    </p>
                    <p className="mt-2 line-clamp-2 text-sm text-[var(--muted)]">
                      {catalog.mainStory.description}
                    </p>
                  </GlassCard>
                </Link>
                <QuestListCard
                  title={catalog.mainStory.title}
                  progressCurrent={aggregateQuestProgress(catalog.mainStory).current}
                  progressRequired={aggregateQuestProgress(catalog.mainStory).required}
                  rewardXp={catalog.mainStory.rewards.xp}
                  href={`/contracts/${catalog.mainStory.id}`}
                  completed={aggregateQuestProgress(catalog.mainStory).complete}
                />
              </>
            ) : (
              <p className="text-center text-sm text-[var(--muted)]">
                No active main story contract.
              </p>
            )}
            {catalog.completed.length > 0 && (
              <section>
                <p className="mb-2 text-xs uppercase tracking-widest text-[var(--muted)]">
                  Extracted ({catalog.completed.length})
                </p>
                <ul className="space-y-2">
                  {catalog.completed.map((q) => (
                    <li key={q.id}>
                      <QuestListCard
                        title={q.title}
                        progressCurrent={1}
                        progressRequired={1}
                        rewardXp={q.rewards.xp}
                        completed
                      />
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}

        {tab === "achievements" && (
          <ul className="space-y-3">
            {achievements.map((a) => (
              <li key={a.id}>
                <QuestListCard
                  title={a.title}
                  progressCurrent={a.unlocked ? 1 : 0}
                  progressRequired={1}
                  rewardXp={a.unlocked ? 150 : 0}
                  claimable={a.unlocked}
                  completed={!a.unlocked}
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </HunterPage>
  )
}
