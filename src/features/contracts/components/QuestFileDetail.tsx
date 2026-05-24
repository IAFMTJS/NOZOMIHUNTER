"use client"

import { useRouter } from "next/navigation"
import type { QuestContract } from "@/contracts/quest-contract"
import { HeroBanner } from "@/components/ui/screen/HeroBanner"
import { MissionBreadcrumb } from "@/components/ui/screen/MissionBreadcrumb"
import { ObjectiveChecklist } from "@/components/ui/screen/ObjectiveChecklist"
import { RewardIconGrid } from "@/components/ui/screen/RewardIconGrid"
import { ScreenCTA } from "@/components/ui/ScreenCTA"
import { StatusChip } from "@/components/ui/StatusChip"
import { Button } from "@/components/ui/Button"
import { getQuestCatalogMeta } from "@/config/missionCatalogMetadata"
import {
  buildQuestRewardIcons,
  resolveQuestStaminaCost,
} from "@/systems/presentation/questRewardPresentation"
import { computeReadiness } from "@/systems/readiness/readinessSystem"
import type { PlayerContract } from "@/contracts/player-contract"
import { isQuestTracked } from "@/systems/quests/contractTrackingSystem"
import { meetsQuestRequirements } from "@/systems/quests/questChannelSystem"
import { buildMissionOpsPresentation } from "@/systems/presentation/missionOpsPresentationSystem"
import { isQuestEncounterPlayable } from "@/systems/quests/questPlayabilitySystem"

interface QuestFileDetailProps {
  quest: QuestContract
  player: PlayerContract
  onTrack: () => void
}

export function QuestFileDetail({ quest, player, onTrack }: QuestFileDetailProps) {
  const router = useRouter()
  const meta = getQuestCatalogMeta(quest)
  const rewards = buildQuestRewardIcons(quest)
  const staminaCost = resolveQuestStaminaCost(quest)
  const readiness = computeReadiness({ player, quest: { type: quest.type } })
  const tracked = isQuestTracked(player, quest.id)
  const flavor = meta.flavorNarrative ?? quest.description
  const ops = buildMissionOpsPresentation(quest)
  const levelOk = meetsQuestRequirements(quest, player)
  const playable = isQuestEncounterPlayable(quest)

  const breadcrumbSegments = [
    { label: "Main Story", href: "/contracts?tab=story" },
    ...(meta.chapterTitle
      ? [{ label: meta.chapterTitle.replace(/^Chapter \d+ · /, "Ch ") }]
      : []),
    {
      label: meta.missionIndex
        ? `Mission ${String(meta.missionIndex).padStart(2, "0")}`
        : quest.title,
    },
  ]

  return (
    <>
      <MissionBreadcrumb segments={breadcrumbSegments} />

      <HeroBanner
        theme={meta.heroTheme}
        rankLabel={quest.narrativeTier === "MAIN" ? "A" : "B"}
        tall
        className="mt-3"
      />

      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-display text-2xl font-semibold text-[var(--foreground)]">
            {quest.title}
          </h1>
          <StatusChip label={quest.type} tone="neutral" />
        </div>
        {meta.titleJa && (
          <p className="font-japanese text-base text-[var(--muted)]">{meta.titleJa}</p>
        )}
      </div>

      <p className="text-sm leading-relaxed text-[var(--muted)]">{flavor}</p>

      <div className="rounded-xl border border-[var(--border-subtle)] bg-black/20 p-3 text-xs text-[var(--muted)]">
        <p>{ops.sectorBlurb}</p>
        <p className="mt-2">
          Instability {ops.instabilityPct}% · Signal {ops.signalStrength}% · Rank{" "}
          {ops.recommendedRank} · {ops.dangerTier}
        </p>
      </div>

      {!playable && (
        <p className="text-sm text-[var(--warning)]">
          Encounter payload incomplete. Re-request from the mission log if deployment fails.
        </p>
      )}

      <section>
        <p className="mb-2 text-xs uppercase tracking-widest text-[var(--muted)]">
          Objectives
        </p>
        <ObjectiveChecklist objectives={quest.objectives} />
      </section>

      <section>
        <p className="mb-2 text-xs uppercase tracking-widest text-[var(--muted)]">
          Rewards
        </p>
        <RewardIconGrid items={rewards} />
      </section>

      <p className="text-center text-xs text-[var(--muted)]">
        {readiness.survivalLabel}
      </p>

      <div className="flex justify-center pb-2">
        <Button variant="ghost" size="sm" onClick={onTrack}>
          {tracked ? "File tracked on home" : "Track on home"}
        </Button>
      </div>

      <ScreenCTA
        label={levelOk ? "Enter dungeon" : "Level too low"}
        staminaCost={staminaCost}
        disabled={!levelOk}
        onClick={() => router.push(`/prepare?questId=${quest.id}`)}
      />
      {!levelOk && (
        <p className="text-center text-xs text-[var(--danger)]">
          Hunter level does not meet contract requirements.
        </p>
      )}
    </>
  )
}
