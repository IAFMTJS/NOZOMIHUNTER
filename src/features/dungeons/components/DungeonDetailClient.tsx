"use client"

import { useRouter } from "next/navigation"
import { useHunterSession } from "@/features/hunter/context/HunterSessionContext"
import { HunterPage } from "@/components/layout/HunterPage"
import { HunterPageBack } from "@/components/layout/HunterPageBack"
import { Button } from "@/components/ui/Button"
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
        <div className="h-40 rounded-2xl bg-gradient-to-br from-[var(--accent)]/20 to-black/70" />
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
                className="flex h-12 w-12 items-center justify-center rounded-lg bg-black/40 text-[10px] uppercase text-[var(--muted)]"
              >
                {e.type.slice(0, 4)}
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
          <ul className="space-y-1 text-sm text-[var(--foreground)]">
            <li>{lootPreview.xp} XP</li>
            {lootPreview.credits != null && lootPreview.credits > 0 && (
              <li>{lootPreview.credits} credits</li>
            )}
            {(lootPreview.items ?? []).map((item, i) => {
              const key = typeof item === "string" ? item : item.itemKey
              const qty = typeof item === "string" ? 1 : item.quantity
              return (
                <li key={`${key}-${i}`}>
                  {qty}× {key.replace(/-/g, " ")}
                </li>
              )
            })}
          </ul>
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
