"use client"

import { useRouter } from "next/navigation"
import { useHunterSession } from "@/features/hunter/context/HunterSessionContext"
import { HunterPage } from "@/components/layout/HunterPage"
import { HunterPageBack } from "@/components/layout/HunterPageBack"
import { Button } from "@/components/ui/Button"
import {
  isObjectiveRevealed,
  objectiveDisplayText,
} from "@/systems/quests/missionCatalogSystem"
import { isQuestTracked } from "@/systems/quests/missionTrackingSystem"

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
        <div className="h-32 rounded-2xl bg-gradient-to-br from-[var(--accent)]/25 to-black/60" />
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
          <div className="flex flex-wrap gap-2 text-sm">
            <span className="rounded bg-[var(--reward)]/20 px-2 py-1 text-[var(--reward)]">
              +{quest.rewards.xp} XP
            </span>
            {quest.rewards.credits != null && (
              <span className="rounded bg-white/10 px-2 py-1">
                {quest.rewards.credits} credits
              </span>
            )}
          </div>
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
          variant="primary"
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
