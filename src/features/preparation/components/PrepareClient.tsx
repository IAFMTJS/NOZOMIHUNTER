"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useHunterSession } from "@/features/hunter/context/HunterSessionContext"
import { HunterPage } from "@/components/layout/HunterPage"
import { HunterPageBack } from "@/components/layout/HunterPageBack"
import { ScreenCTA } from "@/components/ui/ScreenCTA"
import { PreparationRingGauge } from "@/components/preparation/PreparationRingGauge"
import { PreparationChecklist } from "@/components/preparation/PreparationChecklist"
import { PreparationScoreBreakdown } from "@/components/preparation/PreparationScoreBreakdown"
import { DeploymentBlockersPanel } from "@/components/preparation/DeploymentBlockersPanel"
import { MissionVocabularyIntel } from "@/components/preparation/MissionVocabularyIntel"
import { PowerComparison } from "@/components/preparation/PowerComparison"
import { LoadoutSlotGrid } from "@/components/preparation/LoadoutSlotGrid"
import { HeroBanner } from "@/components/ui/screen/HeroBanner"
import { computeReadiness, isReadinessHardBlocked } from "@/systems/readiness/readinessSystem"
import { computePreparationChecklist } from "@/systems/readiness/preparationChecklistSystem"
import {
  isDeployBlocked,
  resolveDeployBlockers,
} from "@/systems/readiness/deployGateSystem"
import { computeHunterPower, recommendedPowerForDungeon } from "@/systems/power/hunterPowerSystem"
import { getDungeonDefinition } from "@/config/dungeonConfig"
import { getQuestCatalogMeta } from "@/config/missionCatalogMetadata"
import { VOCABULARY_PREPARATION_CONFIG } from "@/config/vocabularyPreparationConfig"
import {
  getPreparationDisplayVocabulary,
  hasActivePreparationPhase,
} from "@/systems/vocabulary/vocabularyPreparationOrchestrator"
import { resolveQuestStaminaCost } from "@/systems/presentation/questRewardPresentation"
import { estimatedDungeonTimeLimitMinutes } from "@/systems/presentation/questPresentationSystem"
import { fetchItemCatalog } from "@/features/inventory/services/inventoryActions"
import type { ItemCatalogEntryContract } from "@/contracts/economy-contract"
import { isTrainingQuest } from "@/systems/training/trainingMissionSystem"
import { E2E_TEST_IDS } from "@/config/e2eTestIds"

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
    setHubFocusQuestId,
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

  const vocabPrep = missionQuest?.vocabularyPreparation
  const vocabScore = vocabPrep?.preparationScore
  const readiness = computeReadiness({
    player,
    quest: missionQuest
      ? { type: missionQuest.type }
      : def
        ? { type: "DUNGEON" }
        : undefined,
    vocabularyScore: vocabScore,
  })
  const minVocabScore = VOCABULARY_PREPARATION_CONFIG.DEPLOY_MIN_PREPARATION_SCORE
  const hasVocabPhase =
    missionQuest != null && hasActivePreparationPhase(missionQuest)
  const vocabReady =
    missionQuest == null
      ? true
      : (vocabScore ?? 0) >= minVocabScore || !hasVocabPhase
  const trainingQuest = Boolean(missionQuest && isTrainingQuest(missionQuest))
  const allowCriticalDeploy = trainingQuest
  const operationalReady = !isReadinessHardBlocked(readiness, {
    allowCritical: allowCriticalDeploy,
  })
  const checklist = computePreparationChecklist(
    player,
    vocabReady,
    catalog,
    operationalReady
  )
  const blockers = resolveDeployBlockers({
    readiness,
    checklist,
    allowCriticalDeploy,
    vocabularyPrep:
      missionQuest && hasVocabPhase && vocabPrep
        ? {
            missingCount: vocabPrep.newVocabulary.length,
            currentScore: vocabScore ?? 0,
          }
        : undefined,
  })
  const deployBlocked = isDeployBlocked(blockers)
  const power = computeHunterPower(player)
  const recommended =
    def?.recommendedPower ?? recommendedPowerForDungeon(player.level)
  const underPower = power.total < recommended
  const staminaCost =
    def?.staminaCost ??
    (missionQuest ? resolveQuestStaminaCost(missionQuest) : undefined)

  const timeLimitMin = def
    ? estimatedDungeonTimeLimitMinutes(def.encounterPlan.length)
    : 15

  const displayVocabulary = missionQuest
    ? getPreparationDisplayVocabulary(missionQuest)
    : []
  const missingVocabulary = vocabPrep?.newVocabulary ?? []

  const readinessBaseScore = vocabScore ?? 100
  const readinessBaseLabel =
    vocabScore != null
      ? "Mission vocabulary familiarity"
      : def
        ? "Sector baseline"
        : "Operator baseline"

  async function handleDeploy() {
    if (deployBlocked) return
    if (
      readiness.survivalBand === "UNSTABLE" ||
      (trainingQuest && readiness.survivalBand === "CRITICAL")
    ) {
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
      setHubFocusQuestId(missionQuest.id)
      setHubView("hunt")
      router.push(trainingQuest ? "/training" : "/contracts")
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
        {deployBlocked && <DeploymentBlockersPanel blockers={blockers} />}

        {missionQuest && (hasVocabPhase || displayVocabulary.length > 0) && (
          <MissionVocabularyIntel
            preparationScore={vocabScore ?? readiness.preparationScore}
            displayVocabulary={displayVocabulary}
            missingVocabulary={missingVocabulary}
            missionType={missionQuest.type}
          />
        )}

        <PreparationRingGauge
          score={readiness.preparationScore}
          label="Preparation score"
        />
        <p className="text-center text-xs text-[var(--muted)]">{readiness.survivalLabel}</p>

        <PreparationScoreBreakdown
          readiness={readiness}
          baseLabel={readinessBaseLabel}
          baseScore={readinessBaseScore}
        />

        <PreparationChecklist checklist={checklist} />
        <PowerComparison recommended={recommended} yours={power.total} />

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
        data-testid={E2E_TEST_IDS.prepareDeploy}
        onClick={() => void handleDeploy()}
      />
    </HunterPage>
  )
}
