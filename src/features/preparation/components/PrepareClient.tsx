"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useHunterSession } from "@/features/hunter/context/HunterSessionContext"
import { HunterPage } from "@/components/layout/HunterPage"
import { HunterPageBack } from "@/components/layout/HunterPageBack"
import { ScreenCTA } from "@/components/ui/ScreenCTA"
import { PreparationRingGauge } from "@/components/preparation/PreparationRingGauge"
import { PreparationChecklist } from "@/components/preparation/PreparationChecklist"
import { PowerComparison } from "@/components/preparation/PowerComparison"
import { computeReadiness } from "@/systems/readiness/readinessSystem"
import {
  checklistComplete,
  computePreparationChecklist,
} from "@/systems/readiness/preparationChecklistSystem"
import { computeHunterPower, recommendedPowerForDungeon } from "@/systems/power/hunterPowerSystem"
import { getDungeonDefinition } from "@/config/dungeonConfig"
import { hasActivePreparationPhase } from "@/systems/vocabulary/vocabularyPreparationOrchestrator"
import { fetchItemCatalog } from "@/features/inventory/services/inventoryActions"
import type { ItemCatalogEntryContract } from "@/contracts/economy-contract"

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

  const deployBlocked =
    readiness.survivalBand === "CRITICAL" || !checklistComplete(checklist)
  const underPower = power.total < recommended
  const staminaCost = def?.staminaCost

  async function handleDeploy() {
    if (deployBlocked) return
    if (readiness.survivalBand === "UNSTABLE") {
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

  return (
    <HunterPage className="pb-28">
      <HunterPageBack
        href={dungeonKey ? "/dungeons" : "/contracts"}
        label={dungeonKey ? "Sectors" : "Contracts"}
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
        {underPower && !deployBlocked && (
          <p className="text-center text-xs text-[var(--warning)]">
            Power below sector advisory — confirm to deploy.
          </p>
        )}
      </div>

      <ScreenCTA
        label={dungeonKey ? "Enter dungeon" : "Start mission"}
        staminaCost={staminaCost ?? undefined}
        disabled={deployBlocked || dungeon.busy}
        className={hunterPresentation.huntCtaClass}
        onClick={() => void handleDeploy()}
      />
    </HunterPage>
  )
}
