"use client"

import Link from "next/link"
import { useHunterSession } from "@/features/hunter/context/HunterSessionContext"
import { HunterPage } from "@/components/layout/HunterPage"
import { DUNGEON_DEFINITIONS } from "@/config/dungeonConfig"
import { canStartDungeon } from "@/systems/dungeons/dungeonAccess"
import { computeHunterPower } from "@/systems/power/hunterPowerSystem"
import { DungeonSectorCard } from "@/components/ui/screen/DungeonSectorCard"

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
      <p className="text-sm text-[var(--muted)]">
        Select a sector. Atmospheric breach corridors await deployment.
      </p>
      <ul className="mt-4 space-y-4">
        {DUNGEON_DEFINITIONS.map((def) => {
          const gate = canStartDungeon(player, activeQuests, def.key)
          const locked = !gate.ok && (gate.reason?.includes("locked") ?? false)

          return (
            <li key={def.key} className={locked ? "nozomi-dungeon-locked" : undefined}>
              <DungeonSectorCard
                definition={def}
                locked={locked}
                hunterPower={power.total}
                href={`/dungeons/${encodeURIComponent(def.key)}`}
              />
              {forecast?.dungeon.key === def.key && locked && (
                <p className="mt-1 px-1 text-xs text-[var(--accent-bright)]">
                  {forecast.subline}
                </p>
              )}
              {!gate.ok && !locked && (
                <p className="mt-1 px-1 text-xs text-[var(--warning)]">{gate.reason}</p>
              )}
            </li>
          )
        })}
      </ul>
    </HunterPage>
  )
}
