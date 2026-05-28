"use client"

import { StoryQuestCard } from "@/components/ui/screen/StoryQuestCard"
import { StoryChapterSection } from "@/components/ui/screen/StoryChapterSection"
import { StoryChapterHero } from "@/components/ui/screen/StoryChapterHero"
import { aggregateQuestProgress } from "@/systems/presentation/questPresentationSystem"
import { getQuestCatalogMeta } from "@/config/missionCatalogMetadata"
import type { QuestContract } from "@/contracts/quest-contract"
import type { StoryChapterView } from "@/systems/presentation/storyChapterSystem"

interface ContractsStoryChannelProps {
  storyChapters: StoryChapterView[]
  completed: QuestContract[]
}

export function ContractsStoryChannel({
  storyChapters,
  completed,
}: ContractsStoryChannelProps) {
  return (
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
      {completed.length > 0 && (
        <section>
          <p className="mb-2 text-xs uppercase tracking-widest text-[var(--muted)]">
            Extracted ({completed.length})
          </p>
          <ul className="space-y-2">
            {completed.map((q) => {
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
  )
}
