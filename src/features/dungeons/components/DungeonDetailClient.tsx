"use client"

import { useRouter } from "next/navigation"
import { useHunterSession } from "@/features/hunter/context/HunterSessionContext"
import { HunterPage } from "@/components/layout/HunterPage"
import { HunterPageBack } from "@/components/layout/HunterPageBack"
import { Button } from "@/components/ui/Button"
import { HeroBanner } from "@/components/ui/screen/HeroBanner"
import { RewardRow } from "@/components/ui/screen/RewardRow"
import { rankFromLevel } from "@/systems/progression/rankFromLevel"
import { getDungeonDefinition } from "@/config/dungeonConfig"
import { canStartDungeon } from "@/systems/dungeons/dungeonAccess"
import { computeHunterPower } from "@/systems/power/hunterPowerSystem"
import { canSpendStamina } from "@/systems/economy/staminaSystem"
import { generateDungeon } from "@/systems/dungeons/dungeonGenerator"

interface DungeonDetailClientProps {
  dungeonKey: string
}

export function DungeonDetailClient({ dungeonKey }: DungeonDetailClientProps) {
  const router = useRouter()
  const { player, activeQuests, dungeon, hunterPresentation } = useHunterSession()
  const def = getDungeonDefinition(dungeonKey)

  if (!player) {
    return (
      <HunterPage>
        <p className="text-[var(--muted)]">Loading…</p>
      </HunterPage>
    )
  }

  const gate = canStartDungeon(player, activeQuests, dungeonKey)
  const power = computeHunterPower(player)
  const cost = def.staminaCost
  const hasStamina = canSpendStamina(player, cost)
  const lootPreview = generateDungeon(player.level, def).rewards

  return (
    <HunterPage>
      <HunterPageBack href="/dungeons" label="Sectors" />
      <div className="space-y-5">
        <HeroBanner
          title={def.name}
          rankLabel={rankFromLevel(def.minLevel)}
        />
        <h1 className="font-display text-2xl font-semibold">{def.name}</h1>
        <p className="text-sm text-[var(--muted)]">{def.description}</p>

        <section>
          <p className="mb-2 text-xs uppercase tracking-widest text-[var(--muted)]">
            Enemy signatures
          </p>
          <div className="flex gap-2">
            {def.encounterPlan.map((e) => (
              <span
                key={e.id}
                className="flex h-12 w-12 items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-black/50"
                title={e.type}
              >
                <svg viewBox="0 0 24 24" className="h-8 w-8 text-[var(--accent)]/70" aria-hidden>
                  <ellipse cx="12" cy="14" rx="6" ry="8" fill="currentColor" opacity="0.35" />
                  <circle cx="12" cy="8" r="4" fill="currentColor" opacity="0.5" />
                </svg>
              </span>
            ))}
          </div>
        </section>

        <p className="text-sm text-[var(--muted)]">
          Stamina cost: <span className="text-[var(--foreground)]">{cost}</span> · You have{" "}
          {player.economy.stamina}/{player.economy.staminaMax}
        </p>

        <section>
          <p className="mb-2 text-xs uppercase tracking-widest text-[var(--muted)]">
            Loot preview
          </p>
          <RewardRow
            items={[
              {
                key: "xp",
                label: `${lootPreview.xp} XP`,
                tone: "xp",
              },
              ...(lootPreview.credits != null && lootPreview.credits > 0
                ? [
                    {
                      key: "credits",
                      label: `${lootPreview.credits} credits`,
                      tone: "credits" as const,
                    },
                  ]
                : []),
              ...(lootPreview.items ?? []).map((item, i) => {
                const key = typeof item === "string" ? item : item.itemKey
                const qty = typeof item === "string" ? 1 : item.quantity
                return {
                  key: `${key}-${i}`,
                  label: key.replace(/-/g, " "),
                  quantity: qty,
                  tone: "item" as const,
                }
              }),
            ]}
          />
        </section>

        <Button
          variant="primary"
          size="md"
          className="w-full !py-3"
          disabled={!gate.ok || !hasStamina || dungeon.busy}
          onClick={async () => {
            await dungeon.enter(dungeonKey)
            router.push(`/prepare?dungeonKey=${encodeURIComponent(dungeonKey)}`)
          }}
        >
          Enter dungeon
        </Button>
        {!gate.ok && (
          <p className="text-center text-xs text-[var(--danger)]">{gate.reason}</p>
        )}
        <p className="text-center text-xs text-[var(--muted)]">
          Your power {power.total.toLocaleString()} · Recommended{" "}
          {def.recommendedPower.toLocaleString()}
        </p>
      </div>
    </HunterPage>
  )
}
