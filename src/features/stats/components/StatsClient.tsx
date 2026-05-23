"use client"

import Link from "next/link"
import { useHunterSession } from "@/features/hunter/context/HunterSessionContext"
import { HunterPage } from "@/components/layout/HunterPage"
import { Button } from "@/components/ui/Button"
import { StatBar } from "@/components/ui/screen/StatBar"
import { computeHunterPower } from "@/systems/power/hunterPowerSystem"

const RPG_LABELS = [
  ["strength", "Strength"],
  ["agility", "Agility"],
  ["intelligence", "Intelligence"],
  ["vitality", "Vitality"],
] as const

export function StatsClient() {
  const { player } = useHunterSession()

  if (!player) {
    return (
      <HunterPage>
        <p className="text-[var(--muted)]">Loading operator metrics…</p>
      </HunterPage>
    )
  }

  const power = computeHunterPower(player)
  const maxRpg = Math.max(
    1,
    ...RPG_LABELS.map(([key]) => player.rpgStats[key])
  )

  return (
    <HunterPage>
      <section>
        <p className="mb-3 font-display text-xs uppercase tracking-widest text-[var(--muted)]">
          Core stats
        </p>
        <ul className="space-y-4">
          {RPG_LABELS.map(([key, label]) => (
            <li key={key}>
              <StatBar
                label={label}
                value={player.rpgStats[key]}
                max={maxRpg}
              />
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <p className="mb-3 font-display text-xs uppercase tracking-widest text-[var(--muted)]">
          Battle stats
        </p>
        <ul className="space-y-2 text-sm">
          <li className="flex justify-between">
            <span className="text-[var(--muted)]">Attack</span>
            <span className="tabular-nums font-medium">{power.attack}</span>
          </li>
          <li className="flex justify-between">
            <span className="text-[var(--muted)]">Defense</span>
            <span className="tabular-nums font-medium">{power.defense}</span>
          </li>
          <li className="flex justify-between">
            <span className="text-[var(--muted)]">Critical rate</span>
            <span className="tabular-nums font-medium">{power.critRate}%</span>
          </li>
          <li className="flex justify-between">
            <span className="text-[var(--muted)]">Critical damage</span>
            <span className="tabular-nums font-medium">{power.critDamage}%</span>
          </li>
          <li className="flex justify-between border-t border-[var(--border-subtle)] pt-2 font-semibold">
            <span>Hunter power</span>
            <span className="tabular-nums text-[var(--reward)]">
              {power.total.toLocaleString()}
            </span>
          </li>
        </ul>
      </section>

      <Link href="/profile#operator-metrics" className="mt-8 block">
        <Button variant="primary" size="md" className="w-full !py-3">
          Details — language metrics
        </Button>
      </Link>
    </HunterPage>
  )
}
