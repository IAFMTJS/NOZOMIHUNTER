"use client"

import { useHunterSession } from "@/features/hunter/context/HunterSessionContext"
import { HunterPage } from "@/components/layout/HunterPage"
import { HunterPageBack } from "@/components/layout/HunterPageBack"
import { resolveAchievements } from "@/systems/progression/achievementSystem"

export function AchievementsClient() {
  const { player } = useHunterSession()

  if (!player) {
    return (
      <HunterPage>
        <p className="text-[var(--muted)]">Loading registry…</p>
      </HunterPage>
    )
  }

  const achievements = resolveAchievements(player)

  return (
    <HunterPage>
      <HunterPageBack href="/profile" label="Profile" />
      <h1 className="font-display text-xl font-semibold tracking-wide">Achievements</h1>
      <ul className="mt-6 space-y-3">
        {achievements.map((a) => (
          <li
            key={a.id}
            className={`rounded-xl border px-4 py-3 ${
              a.unlocked
                ? "border-[var(--accent)]/40 bg-[var(--accent)]/10"
                : "border-[var(--border-subtle)] opacity-60"
            }`}
          >
            <p className="font-display text-sm font-semibold text-[var(--foreground)]">
              {a.title}
            </p>
            <p className="mt-1 text-xs text-[var(--muted)]">{a.description}</p>
            <p className="mt-2 text-[10px] uppercase tracking-wider text-[var(--muted)]">
              {a.unlocked ? "Unlocked" : "Locked"}
            </p>
          </li>
        ))}
      </ul>
    </HunterPage>
  )
}
