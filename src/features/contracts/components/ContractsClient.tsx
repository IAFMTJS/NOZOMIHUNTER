"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useHunterSession } from "@/features/hunter/context/HunterSessionContext"
import { HunterPage } from "@/components/layout/HunterPage"
import { TabBar } from "@/components/ui/TabBar"
import { QuestListCard } from "@/components/ui/screen/QuestListCard"
import { RoutineCard } from "@/components/ui/cards/RoutineCard"
import { OperativeCard } from "@/components/ui/cards/OperativeCard"
import { UI_TOKENS } from "@/config/uiTokens"
import { StoryQuestCard } from "@/components/ui/screen/StoryQuestCard"
import { StoryChapterSection } from "@/components/ui/screen/StoryChapterSection"
import { StoryChapterHero } from "@/components/ui/screen/StoryChapterHero"
import { ContractTypeIcon } from "@/components/ui/screen/ContractTypeIcon"
import { QuestChannelShell } from "@/features/contracts/components/QuestChannelShell"
import { QuestChannelHeader } from "@/features/contracts/components/QuestChannelHeader"
import { QuestOpsStrip } from "@/features/contracts/components/QuestOpsStrip"
import { buildContractCatalog } from "@/systems/quests/contractCatalogSystem"
import { aggregateQuestProgress } from "@/systems/presentation/questPresentationSystem"
import { buildStoryChapters } from "@/systems/presentation/storyChapterSystem"
import { getQuestCatalogMeta } from "@/config/missionCatalogMetadata"
import { resolveAchievements } from "@/systems/progression/achievementSystem"
import { loadCompletedQuestSnapshots } from "@/services/supabase/playerRepository"
import {
  selectChannelSystemMessage,
} from "@/systems/messaging/systemMessagingSystem"
import { getTrackedQuest } from "@/systems/quests/contractTrackingSystem"
import { buildMissionOpsPresentation } from "@/systems/presentation/missionOpsPresentationSystem"
import type { QuestContract } from "@/contracts/quest-contract"

export type QuestChannelTab = "daily" | "story" | "side" | "achievements"

const TABS: { id: QuestChannelTab; label: string }[] = [
  { id: "daily", label: "Daily" },
  { id: "story", label: "Story" },
  { id: "side", label: "Side" },
  { id: "achievements", label: "Achievements" },
]

function parseTab(value: string | null): QuestChannelTab {
  if (value === "story" || value === "side" || value === "achievements" || value === "daily") {
    return value
  }
  if (value === "weekly") return "story"
  return "daily"
}

export function ContractsClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, player, regularQuests, activeQuests, quest } = useHunterSession()
  const [completedQuests, setCompletedQuests] = useState<QuestContract[]>([])
  const tab = parseTab(searchParams.get("tab"))

  useEffect(() => {
    if (!user?.id) return
    void loadCompletedQuestSnapshots(user.id).then(setCompletedQuests).catch(() => {
      setCompletedQuests([])
    })
  }, [user?.id, regularQuests.length])

  function setTab(next: QuestChannelTab) {
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", next)
    router.replace(`/contracts?${params.toString()}`, { scroll: false })
  }

  const systemLine = useMemo(() => {
    if (!player) return null
    const seed = `${player.id}:${new Date().toISOString().slice(0, 10)}`
    const channel =
      tab === "daily" || tab === "side" ? tab : undefined
    return selectChannelSystemMessage({ player, activeQuests, seed }, channel)
  }, [player, activeQuests, tab])

  if (!player) {
    return (
      <HunterPage>
        <p className="text-[var(--muted)]">Loading mission log…</p>
      </HunterPage>
    )
  }

  const completedIds = completedQuests.map((q) => q.id)
  const catalog = buildContractCatalog(regularQuests, completedIds)
  const storyChapters = buildStoryChapters(
    catalog.mainStoryQuests,
    completedQuests,
    completedIds
  )
  const achievements = resolveAchievements(player)
  const tracked = getTrackedQuest(activeQuests, player)
  const dailyQuests = catalog.dailyQuests

  const screenClass =
    tab === "daily"
      ? "nozomi-screen-daily"
      : tab === "story"
        ? "nozomi-screen-story"
        : tab === "side"
          ? "nozomi-screen-side"
          : ""

  return (
    <HunterPage className={`pb-4 ${screenClass}`}>
      <QuestChannelShell>
        <QuestChannelHeader systemLine={systemLine} />

        <QuestOpsStrip
          stamina={player.economy.stamina}
          staminaMax={player.economy.staminaMax}
          trackedTitle={tracked?.title}
          trackedHref={tracked ? `/contracts/${tracked.id}` : null}
          showRequest={tab === "daily" || tab === "side"}
          trainingHref={tab === "daily" || tab === "side" ? "/training" : undefined}
          requestBusy={quest.busy}
          onRequest={() =>
            void quest.newQuest(tab === "daily" ? "daily" : "side")
          }
        />

        <TabBar tabs={TABS} active={tab} onChange={setTab} />

        {tab === "story" && (
          <div className="space-y-5">
            {storyChapters.length === 0 ? (
              <p className="text-center text-sm text-[var(--muted)]">
                No story files indexed. Request a contract or complete the tutorial.
              </p>
            ) : (
              storyChapters.map((chapter) => (
                <div key={chapter.chapterId} className="space-y-4">
                  <StoryChapterHero
                    chapterTitle={chapter.chapterTitle}
                    progressPercent={chapter.progressPercent}
                    currentMission={chapter.currentMissionIndex}
                    totalMissions={chapter.totalMissions}
                  />
                  <StoryChapterSection chapterTitle={chapter.chapterTitle}>
                    {chapter.missions.map((row) => {
                      if (row.kind === "placeholder") {
                        const p = row.placeholder
                        return (
                          <li key={p.id}>
                            <StoryQuestCard
                              index={p.missionIndex}
                              title={p.title}
                              titleJa={p.titleJa}
                              progressCurrent={0}
                              progressRequired={1}
                              rewardXp={p.rewardXp}
                              state="locked"
                            />
                          </li>
                        )
                      }
                      const q = row.quest
                      const meta = getQuestCatalogMeta(q)
                      const prog = aggregateQuestProgress(q)
                      return (
                        <li key={q.id}>
                          <StoryQuestCard
                            index={row.missionIndex}
                            title={q.title}
                            titleJa={meta.titleJa}
                            progressCurrent={prog.current}
                            progressRequired={prog.required}
                            rewardXp={q.rewards.xp}
                            state={
                              row.locked
                                ? "locked"
                                : prog.complete
                                  ? "complete"
                                  : "active"
                            }
                            href={row.locked ? undefined : `/contracts/${q.id}?tab=story`}
                          />
                        </li>
                      )
                    })}
                  </StoryChapterSection>
                </div>
              ))
            )}
            {catalog.completed.length > 0 && (
              <section>
                <p className="mb-2 text-xs uppercase tracking-widest text-[var(--muted)]">
                  Extracted ({catalog.completed.length})
                </p>
                <ul className="space-y-2">
                  {catalog.completed.map((q) => {
                    const meta = getQuestCatalogMeta(q)
                    return (
                      <li key={q.id}>
                        <StoryQuestCard
                          index={meta.missionIndex ?? 0}
                          title={q.title}
                          titleJa={meta.titleJa}
                          progressCurrent={1}
                          progressRequired={1}
                          rewardXp={q.rewards.xp}
                          state="complete"
                          href={`/contracts/${q.id}?tab=story`}
                        />
                      </li>
                    )
                  })}
                </ul>
              </section>
            )}
          </div>
        )}

        {tab === "daily" && (
          <ul className={`nozomi-contract-list-daily ${UI_TOKENS.channelDaily}`}>
            {dailyQuests.length === 0 ? (
              <p className="text-center text-sm text-[var(--muted)]">
                No daily contracts. Request deployment from the ops strip.
              </p>
            ) : (
              dailyQuests.map((q) => {
                const prog = aggregateQuestProgress(q)
                const meta = getQuestCatalogMeta(q)
                const ops = buildMissionOpsPresentation(q)
                const href = `/contracts/${q.id}?tab=daily`
                return (
                  <li key={q.id}>
                    <Link
                      href={href}
                      className="block rounded-xl transition-transform hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                      aria-label={`Open contract: ${q.title}`}
                    >
                      <RoutineCard className="flex items-stretch gap-2 !p-3">
                        <ContractTypeIcon type={q.type} />
                        <div className="min-w-0 flex-1">
                          <StoryQuestCard
                            index={meta.missionIndex ?? 1}
                            title={q.title}
                            titleJa={meta.titleJa}
                            sectorBlurb={ops.sectorBlurb}
                            dangerTier={ops.dangerTier}
                            progressCurrent={prog.current}
                            progressRequired={prog.required}
                            rewardXp={q.rewards.xp}
                            state={prog.complete ? "complete" : "active"}
                          />
                        </div>
                      </RoutineCard>
                    </Link>
                  </li>
                )
              })
            )}
          </ul>
        )}

        {tab === "side" && (
          <ul className={`nozomi-contract-list-side ${UI_TOKENS.channelSide}`}>
            {catalog.sideQuests.length === 0 && !catalog.mainStory ? (
              <p className="text-center text-sm text-[var(--muted)]">
                No side contracts active.
              </p>
            ) : (
              catalog.sideQuests
                .map((q) => {
                  const prog = aggregateQuestProgress(q)
                  const meta = getQuestCatalogMeta(q)
                  const ops = buildMissionOpsPresentation(q)
                  const href = `/contracts/${q.id}?tab=side`
                  return (
                    <li key={q.id}>
                      <Link
                        href={href}
                        className="block rounded-xl transition-transform hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                        aria-label={`Open contract: ${q.title}`}
                      >
                        <OperativeCard className="flex items-stretch gap-2 !p-3">
                          <ContractTypeIcon type={q.type} />
                          <div className="min-w-0 flex-1">
                            <StoryQuestCard
                              index={meta.missionIndex ?? 1}
                              title={q.title}
                              titleJa={meta.titleJa}
                              sectorBlurb={ops.sectorBlurb}
                              dangerTier={ops.dangerTier}
                              progressCurrent={prog.current}
                              progressRequired={prog.required}
                              rewardXp={q.rewards.xp}
                              state={prog.complete ? "complete" : "active"}
                            />
                          </div>
                        </OperativeCard>
                      </Link>
                    </li>
                  )
                })
            )}
          </ul>
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
      </QuestChannelShell>
    </HunterPage>
  )
}
