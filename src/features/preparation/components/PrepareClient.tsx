"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useHunterSession } from "@/features/hunter/context/HunterSessionContext"
import { HunterPage } from "@/components/layout/HunterPage"
import { HunterPageBack } from "@/components/layout/HunterPageBack"
import { ScreenCTA } from "@/components/ui/ScreenCTA"
import { PreparationRingGauge } from "@/components/preparation/PreparationRingGauge"
import { PreparationChecklist } from "@/components/preparation/PreparationChecklist"
import { PowerComparison } from "@/components/preparation/PowerComparison"
import { LoadoutSlotGrid } from "@/components/preparation/LoadoutSlotGrid"
import { HeroBanner } from "@/components/ui/screen/HeroBanner"
import { computeReadiness, isReadinessHardBlocked } from "@/systems/readiness/readinessSystem"
import {
  checklistComplete,
  computePreparationChecklist,
} from "@/systems/readiness/preparationChecklistSystem"
import { computeHunterPower, recommendedPowerForDungeon } from "@/systems/power/hunterPowerSystem"
import { getDungeonDefinition } from "@/config/dungeonConfig"
import { getQuestCatalogMeta } from "@/config/missionCatalogMetadata"
import { hasActivePreparationPhase } from "@/systems/vocabulary/vocabularyPreparationOrchestrator"
import { resolveQuestStaminaCost } from "@/systems/presentation/questRewardPresentation"
import {
  estimatedDungeonTimeLimitMinutes,
} from "@/systems/presentation/questPresentationSystem"
import { fetchItemCatalog } from "@/features/inventory/services/inventoryActions"
import type { ItemCatalogEntryContract } from "@/contracts/economy-contract"
import { isTrainingQuest } from "@/systems/training/trainingMissionSystem"

export function PrepareClient() {
  const router = useRouter()
  const params = useSearchParams()
  const questId = params.get("questId")
  const dungeonKey = params.get("dungeonKey")
  const {
    player,
    regularQuests,
    activeQuests,
    quest: questLogic,
    dungeon,
    setHubView,
    hunterPresentation,
  } = useHunterSession()

  const [catalog, setCatalog] = useState<ItemCatalogEntryContract[]>([])

  useEffect(() => {
    void fetchItemCatalog().then(setCatalog)
  }, [])

  const missionQuest =
    regularQuests.find((q) => q.id === questId) ??
    activeQuests.find((q) => q.id === questId)
  const def = dungeonKey ? getDungeonDefinition(dungeonKey) : null
  const questMeta = missionQuest ? getQuestCatalogMeta(missionQuest) : null

  if (!player) {
    return (
      <HunterPage>
        <p className="text-[var(--muted)]">Loading…</p>
      </HunterPage>
    )
  }

  const vocabScore = missionQuest?.vocabularyPreparation?.preparationScore
  const readiness = computeReadiness({
    player,
    quest: missionQuest
      ? { type: missionQuest.type }
      : def
        ? { type: "DUNGEON" }
        : undefined,
    vocabularyScore: vocabScore,
  })
  const vocabReady =
    missionQuest != null
      ? (vocabScore ?? 0) >= 60 || !hasActivePreparationPhase(missionQuest)
      : true
  const checklist = computePreparationChecklist(player, vocabReady, catalog)
  const power = computeHunterPower(player)
  const recommended =
    def?.recommendedPower ?? recommendedPowerForDungeon(player.level)
  const trainingQuest = Boolean(missionQuest && isTrainingQuest(missionQuest))
  const allowCriticalDeploy = trainingQuest

  const readinessBlocked = isReadinessHardBlocked(readiness, {
    allowCritical: allowCriticalDeploy,
  })
  const deployBlocked = readinessBlocked || !checklistComplete(checklist)
  const underPower = power.total < recommended
  const staminaCost =
    def?.staminaCost ??
    (missionQuest ? resolveQuestStaminaCost(missionQuest) : undefined)

  const timeLimitMin = def
    ? estimatedDungeonTimeLimitMinutes(def.encounterPlan.length)
    : 15

  async function handleDeploy() {
    if (deployBlocked) return
    if (readiness.survivalBand === "UNSTABLE" || (trainingQuest && readiness.survivalBand === "CRITICAL")) {
      const ok = window.confirm(
        "Operational readiness unstable. Deployment is risky — proceed?"
      )
      if (!ok) return
    }
    if (underPower) {
      const ok = window.confirm(
        `Recommended power ${recommended.toLocaleString()} — yours ${power.total.toLocaleString()}. Deploy anyway?`
      )
      if (!ok) return
    }
    if (missionQuest) {
      if (hasActivePreparationPhase(missionQuest)) {
        await questLogic.dismissPreparation(missionQuest.id)
      }
      setHubView("hunt")
      router.push("/contracts")
    } else if (dungeonKey) {
      await dungeon.deploy()
      setHubView("sector")
      router.push("/dungeons")
    }
  }

  const deploymentTitle = def?.name ?? missionQuest?.title ?? "Deployment"
  const rankLabel = def ? "D" : missionQuest?.difficulty?.slice(0, 1) ?? "C"

  return (
    <HunterPage className="nozomi-screen-prep">
      <HunterPageBack
        href={
          missionQuest
            ? `/contracts/${missionQuest.id}`
            : dungeonKey
              ? `/dungeons`
              : "/contracts"
        }
        label="Mission file"
      />

      <HeroBanner
        theme={questMeta?.heroTheme ?? def?.theme}
        rankLabel={rankLabel}
        title={deploymentTitle}
        tall
      />

      <div className="nozomi-embedded rounded-xl px-4 py-3 text-sm text-[var(--muted)]">
        <p className="font-display text-xs uppercase tracking-widest text-[var(--accent-bright)]">
          Sector briefing
        </p>
        <p className="mt-2">
          {def?.description ??
            missionQuest?.description ??
            "Confirm loadout and readiness before entering the gate."}
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-[10px] uppercase tracking-wider">
          {staminaCost != null && <span>Stamina {staminaCost}</span>}
          <span>Time limit {timeLimitMin}:00</span>
          {def && <span>Rank {rankLabel}</span>}
        </div>
      </div>

      <LoadoutSlotGrid
        buildName={
          missionQuest?.type === "LISTENING"
            ? "Listening Build"
            : missionQuest?.type === "VOCABULARY"
              ? "Extraction Build"
              : "Hunter Build"
        }
      />

      <div className="space-y-6">
        <PreparationRingGauge
          score={readiness.preparationScore}
          label="Preparation score"
        />
        <p className="text-center text-xs text-[var(--muted)]">{readiness.survivalLabel}</p>
        <PreparationChecklist checklist={checklist} />
        <PowerComparison recommended={recommended} yours={power.total} />

        {deployBlocked && (
          <p className="text-center text-xs text-[var(--danger)]">
            Deployment locked — complete preparation checklist and raise operational readiness.
          </p>
        )}
        {deployBlocked && (
          <p className="text-center text-xs text-[var(--muted)]">
            Recovery route:{" "}
            <Link href="/training" className="text-[var(--accent-bright)] hover:underline">
              training drills
            </Link>{" "}
            and{" "}
            <Link href="/vocabulary" className="text-[var(--accent-bright)] hover:underline">
              vocabulary
            </Link>
            .
          </p>
        )}
        {underPower && !deployBlocked && (
          <p className="text-center text-xs text-[var(--warning)]">
            Power below sector advisory — confirm to deploy.
          </p>
        )}
      </div>

      <ScreenCTA
        label={trainingQuest ? "Start drill" : missionQuest ? "Deploy contract" : "Enter dungeon"}
        staminaCost={staminaCost ?? undefined}
        disabled={deployBlocked || dungeon.busy}
        className={hunterPresentation.huntCtaClass}
        onClick={() => void handleDeploy()}
      />
    </HunterPage>
  )
}
