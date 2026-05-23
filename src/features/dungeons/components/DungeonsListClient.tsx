"use client"

import Link from "next/link"
import { useHunterSession } from "@/features/hunter/context/HunterSessionContext"
import { HunterPage } from "@/components/layout/HunterPage"
import { DUNGEON_DEFINITIONS } from "@/config/dungeonConfig"
import { canStartDungeon } from "@/systems/dungeons/dungeonAccess"
import { computeHunterPower, recommendedPowerForDungeon } from "@/systems/power/hunterPowerSystem"
import { StatusChip } from "@/components/ui/StatusChip"
import { RankChip } from "@/components/ui/screen/RankChip"
import { rankFromLevel } from "@/systems/progression/rankFromLevel"

export function DungeonsListClient() {
  const { player, activeQuests, forecast } = useHunterSession()

  if (!player) {
    return (
      <HunterPage>
        <p className="text-[var(--muted)]">Loading sectors…</p>
      </HunterPage>
    )
  }

  const power = computeHunterPower(player)

  return (
    <HunterPage>
      <ul className="space-y-3">
        {DUNGEON_DEFINITIONS.map((def) => {
          const gate = canStartDungeon(player, activeQuests, def.key)
          const locked = !gate.ok && gate.reason?.includes("locked")
          const rec = def.recommendedPower ?? recommendedPowerForDungeon(def.minLevel)

          return (
            <li key={def.key}>
              <Link
                href={locked ? "#" : `/dungeons/${encodeURIComponent(def.key)}`}
                className={`block rounded-2xl border p-4 ${
                  locked
                    ? "pointer-events-none border-[var(--border-subtle)] opacity-50"
                    : "border-[var(--border-subtle)] bg-black/20 hover:border-[var(--accent)]/40"
                }`}
                onClick={(e) => locked && e.preventDefault()}
              >
                <div className="flex items-start justify-between gap-2">
                  <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">
                    {def.name}
                  </h2>
                  <div className="flex shrink-0 items-center gap-1">
                    <RankChip
                      rank={rankFromLevel(def.minLevel)}
                      tone={locked ? "locked" : "accent"}
                    />
                    {locked ? (
                      <span aria-hidden>🔒</span>
                    ) : (
                      <StatusChip label={`Lv ${def.minLevel}+`} tone="accent" />
                    )}
                  </div>
                </div>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  Recommended power {rec.toLocaleString()} · Your {power.total.toLocaleString()}
                </p>
                {forecast?.dungeon.key === def.key && locked && (
                  <p className="mt-2 text-xs text-[var(--accent-bright)]">
                    {forecast.subline}
                  </p>
                )}
                {!gate.ok && !locked && (
                  <p className="mt-2 text-xs text-[var(--warning)]">{gate.reason}</p>
                )}
              </Link>
            </li>
          )
        })}
      </ul>
    </HunterPage>
  )
}
