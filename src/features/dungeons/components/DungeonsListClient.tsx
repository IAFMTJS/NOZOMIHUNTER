"use client"

import { useHunterSession } from "@/features/hunter/context/HunterSessionContext"
import { HunterPage } from "@/components/layout/HunterPage"
import { DUNGEON_DEFINITIONS } from "@/config/dungeonConfig"
import { canStartDungeon } from "@/systems/dungeons/dungeonAccess"
import { computeHunterPower } from "@/systems/power/hunterPowerSystem"
import { DungeonSectorCard } from "@/components/ui/screen/DungeonSectorCard"
import { SectorCard } from "@/components/ui/cards/SectorCard"
import { UI_TOKENS } from "@/config/uiTokens"
import { Button } from "@/components/ui/Button"
import { E2E_TEST_IDS } from "@/config/e2eTestIds"

export function DungeonsListClient() {
  const { player, activeQuests, activeDungeon, dungeon, forecast, setHubView } =
    useHunterSession()

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
      {activeDungeon && (
        <div
          className="mt-3 rounded-xl border border-[var(--warning)]/40 bg-[var(--warning)]/10 p-3"
          data-testid="dungeon-active-run-banner"
        >
          <p className="text-xs text-[var(--warning)]">
            Active run detected: {activeDungeon.title}
          </p>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <Button
              variant="cta"
              size="sm"
              className="w-full sm:flex-1"
              disabled={dungeon.busy}
              data-testid={E2E_TEST_IDS.dungeonResume}
              onClick={() => setHubView("sector")}
            >
              Resume corridor
            </Button>
            <Button
              variant="danger"
              size="sm"
              disabled={dungeon.busy}
              className="w-full sm:flex-1"
              data-testid={E2E_TEST_IDS.dungeonAbandon}
              onClick={() => void dungeon.abandon()}
            >
              Abandon active run
            </Button>
          </div>
        </div>
      )}
      <ul className={`mt-4 ${UI_TOKENS.channelSector}`}>
        {DUNGEON_DEFINITIONS.map((def) => {
          const gate = canStartDungeon(player, activeQuests, def.key)
          const locked = !gate.ok && (gate.reason?.includes("locked") ?? false)

          return (
            <li key={def.key} className={locked ? "nozomi-dungeon-locked" : undefined}>
              <SectorCard className="!p-0 overflow-hidden">
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
              </SectorCard>
            </li>
          )
        })}
      </ul>
    </HunterPage>
  )
}
