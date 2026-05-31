"use client"

import { useRouter } from "next/navigation"
import { useHunterSession } from "@/features/hunter/context/HunterSessionContext"
import { HunterPage } from "@/components/layout/HunterPage"
import { HunterPageBack } from "@/components/layout/HunterPageBack"
import { Button } from "@/components/ui/Button"
import { HeroBanner } from "@/components/ui/screen/HeroBanner"
import { StatGrid } from "@/components/ui/screen/StatGrid"
import { RewardIcon } from "@/components/ui/screen/RewardIcon"
import { rankFromLevel } from "@/systems/progression/rankFromLevel"
import { getDungeonDefinition } from "@/config/dungeonConfig"
import { canStartDungeon } from "@/systems/dungeons/dungeonAccess"
import { computeHunterPower } from "@/systems/power/hunterPowerSystem"
import { canSpendStamina } from "@/systems/economy/staminaSystem"
import { generateDungeon } from "@/systems/dungeons/dungeonGenerator"
import { estimatedDungeonTimeLimitMinutes } from "@/systems/presentation/questPresentationSystem"
import { E2E_TEST_IDS } from "@/config/e2eTestIds"
import { buildDungeonEntryTension } from "@/systems/presentation/dungeonEntryPresentation"
import { DungeonEntryTension } from "@/features/dungeons/components/DungeonEntryTension"
import { buildSectorCorruptionView } from "@/systems/world/sectorCorruptionSystem"
import { computeReadiness, isReadinessHardBlocked } from "@/systems/readiness/readinessSystem"
import { computePreparationChecklist } from "@/systems/readiness/preparationChecklistSystem"
import {
  isDeployBlocked,
  resolveDeployBlockers,
  MIN_OPERATIONAL_READINESS_SCORE,
} from "@/systems/readiness/deployGateSystem"
import { DeploymentBlockersPanel } from "@/components/preparation/DeploymentBlockersPanel"

interface DungeonDetailClientProps {
  dungeonKey: string
}

function StaminaIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="var(--reward)" aria-hidden>
      <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" />
    </svg>
  )
}

export function DungeonDetailClient({ dungeonKey }: DungeonDetailClientProps) {
  const router = useRouter()
  const { player, activeQuests, dungeon, regularQuests } = useHunterSession()
  const def = getDungeonDefinition(dungeonKey)

  if (!player) {
    return (
      <HunterPage>
        <p className="text-[var(--muted)]">Loading…</p>
      </HunterPage>
    )
  }

  const seed = `${player.id}:${new Date().toISOString().slice(0, 10)}`
  const gate = canStartDungeon(player, activeQuests, dungeonKey)
  const power = computeHunterPower(player)
  const cost = def.staminaCost
  const hasStamina = canSpendStamina(player, cost)
  const lootPreview = generateDungeon(player.level, def).rewards
  const maxDifficulty = Math.max(...def.encounterPlan.map((e) => e.difficulty))
  const timeLimit = estimatedDungeonTimeLimitMinutes(def.encounterPlan.length)
  const entryTension = buildDungeonEntryTension(def)
  const sectorView = buildSectorCorruptionView(
    player,
    [...activeQuests, ...regularQuests],
    seed
  )
  const readiness = computeReadiness({ player, quest: { type: "DUNGEON" } })
  const operationalReady = !isReadinessHardBlocked(readiness)
  const checklist = computePreparationChecklist(player, true, [], operationalReady)
  const blockers = resolveDeployBlockers({ readiness, checklist })
  const readinessBlocked = isDeployBlocked(blockers)
  const canEnter = gate.ok && hasStamina && !readinessBlocked && !dungeon.busy

  return (
    <HunterPage className="pb-28">
      <HunterPageBack href="/dungeons" label="Sectors" />
      <div className="space-y-5">
        <HeroBanner
          title={def.name}
          rankLabel={rankFromLevel(def.minLevel)}
          theme={def.theme}
          tall
        />
        <p className="text-sm leading-relaxed text-[var(--muted)]">{def.description}</p>
        <DungeonEntryTension copy={entryTension} />
        <p className="text-xs text-[var(--muted)]">
          Sector corruption: {sectorView.corruptionPercent}% — {sectorView.subline}
        </p>

        <div className="nozomi-embedded rounded-xl px-4 py-3 text-sm">
          <p className="text-xs uppercase tracking-widest text-[var(--accent-bright)]">
            Deployment readiness
          </p>
          <p className="mt-2 font-mono text-lg text-[var(--foreground)]">
            {readiness.preparationScore}%
            <span className="ml-2 text-xs text-[var(--muted)]">
              (minimum {MIN_OPERATIONAL_READINESS_SCORE}%)
            </span>
          </p>
          <p className="mt-1 text-xs text-[var(--muted)]">{readiness.survivalLabel}</p>
        </div>

        {readinessBlocked && <DeploymentBlockersPanel blockers={blockers} />}

        <StatGrid
          items={[
            { label: "Enemy level", value: String(maxDifficulty) },
            { label: "Suggested rank", value: rankFromLevel(def.minLevel) },
            {
              label: "Stamina cost",
              value: String(cost),
              icon: <StaminaIcon />,
            },
            { label: "Time limit", value: `${timeLimit} min` },
          ]}
        />

        <section>
          <p className="mb-3 text-xs uppercase tracking-widest text-[var(--muted)]">
            Possible rewards
          </p>
          <div className="flex flex-wrap gap-4">
            <RewardIcon label={`${lootPreview.xp} XP`} tone="xp" />
            {lootPreview.credits != null && lootPreview.credits > 0 && (
              <RewardIcon label={`${lootPreview.credits} CR`} tone="credits" />
            )}
            {(lootPreview.items ?? []).slice(0, 3).map((item, i) => {
              const key = typeof item === "string" ? item : item.itemKey
              const qty = typeof item === "string" ? 1 : item.quantity
              return (
                <RewardIcon
                  key={`${key}-${i}`}
                  label={key.replace(/-/g, " ")}
                  tone="item"
                  quantity={qty}
                />
              )
            })}
          </div>
        </section>

        {!gate.ok && (
          <p className="text-center text-xs text-[var(--danger)]">{gate.reason}</p>
        )}
        <p className="text-center text-xs text-[var(--muted)]">
          Your power {power.total.toLocaleString()} · Recommended{" "}
          {def.recommendedPower.toLocaleString()}
        </p>
      </div>

      <div className="hunter-overlay-above-nav fixed left-0 right-0 z-50 border-t border-[var(--border-subtle)] bg-gradient-to-t from-[var(--background)] via-[var(--background)]/95 to-transparent px-4 pb-safe pt-3">
        <div className="mx-auto max-w-lg">
          <Button
            variant="cta"
            size="md"
            className="w-full !py-3.5"
            disabled={!canEnter}
            data-testid={E2E_TEST_IDS.dungeonEnter}
            onClick={async () => {
              if (!canEnter) return
              await dungeon.enter(dungeonKey)
              router.push(`/prepare?dungeonKey=${encodeURIComponent(dungeonKey)}`)
            }}
          >
            Enter dungeon
            <span className="ml-2 inline-flex items-center gap-1 rounded bg-[var(--overlay-panel-strong)] px-2 py-0.5 text-xs font-bold">
              <StaminaIcon />
              {cost}
            </span>
          </Button>
        </div>
      </div>
    </HunterPage>
  )
}
