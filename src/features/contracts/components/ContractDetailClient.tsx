"use client"

import { useRouter } from "next/navigation"
import { useHunterSession } from "@/features/hunter/context/HunterSessionContext"
import { HunterPage } from "@/components/layout/HunterPage"
import { HunterPageBack } from "@/components/layout/HunterPageBack"
import { Button } from "@/components/ui/Button"
import { HeroBanner } from "@/components/ui/screen/HeroBanner"
import { RewardRow } from "@/components/ui/screen/RewardRow"
import {
  isObjectiveRevealed,
  objectiveDisplayText,
} from "@/systems/quests/contractCatalogSystem"
import { isQuestTracked } from "@/systems/quests/contractTrackingSystem"

interface ContractDetailClientProps {
  questId: string
}

export function ContractDetailClient({ questId }: ContractDetailClientProps) {
  const router = useRouter()
  const { player, regularQuests, trackMission, setHubView } = useHunterSession()

  const quest = regularQuests.find((q) => q.id === questId)

  if (!player || !quest) {
    return (
      <HunterPage>
        <HunterPageBack href="/contracts" label="Contracts" />
        <p className="text-[var(--muted)]">Contract not found.</p>
      </HunterPage>
    )
  }

  const tracked = isQuestTracked(player, quest.id)

  return (
    <HunterPage>
      <HunterPageBack href="/contracts" label="Contracts" />
      <div className="space-y-5">
        <HeroBanner title={quest.title} rankLabel={quest.narrativeTier === "MAIN" ? "A" : "B"} />
        <div>
          <h1 className="font-display text-2xl font-semibold text-[var(--foreground)]">
            {quest.title}
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)]">{quest.description}</p>
        </div>

        <section>
          <p className="mb-2 text-xs uppercase tracking-widest text-[var(--muted)]">
            Objectives
          </p>
          <ul className="space-y-2">
            {quest.objectives.map((obj) => (
              <li
                key={obj.id}
                className="flex items-center gap-2 rounded-lg border border-[var(--border-subtle)] px-3 py-2 text-sm"
              >
                <span className={obj.completed ? "text-[var(--success)]" : "text-[var(--muted)]"}>
                  {obj.completed ? "✓" : isObjectiveRevealed(obj) ? "○" : "🔒"}
                </span>
                <span
                  className={
                    isObjectiveRevealed(obj)
                      ? "text-[var(--foreground)]"
                      : "text-[var(--muted)]"
                  }
                >
                  {objectiveDisplayText(obj)}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <p className="mb-2 text-xs uppercase tracking-widest text-[var(--muted)]">
            Rewards
          </p>
          <RewardRow
            items={[
              {
                key: "xp",
                label: `+${quest.rewards.xp} XP`,
                tone: "xp",
              },
              ...(quest.rewards.credits != null && quest.rewards.credits > 0
                ? [
                    {
                      key: "credits",
                      label: `${quest.rewards.credits} credits`,
                      tone: "credits" as const,
                    },
                  ]
                : []),
            ]}
          />
        </section>

        <Button
          variant="primary"
          size="md"
          className="w-full !py-3"
          onClick={() => void trackMission(quest.id)}
        >
          {tracked ? "Contract tracked" : "Track contract"}
        </Button>

        <Button
          variant="ghost"
          size="md"
          className="w-full !py-3"
          onClick={() => {
            setHubView("hunt")
            router.push(`/prepare?questId=${quest.id}`)
          }}
        >
          Deploy
        </Button>
      </div>
    </HunterPage>
  )
}
