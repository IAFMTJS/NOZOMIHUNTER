"use client"

import { useMemo } from "react"
import type { QuestContract } from "@/contracts/quest-contract"
import type { PlayerContract } from "@/contracts/player-contract"
import type { ReadinessResultContract } from "@/contracts/readiness-contract"
import type { DungeonForecastContract } from "@/systems/dungeons/dungeonForecastSystem"
import { Panel } from "@/components/ui/Panel"
import { StatusChip } from "@/components/ui/StatusChip"
import { HunterIdentityBlock } from "@/components/hunter/HunterIdentityBlock"
import { SystemMessageRail } from "@/components/hunter/SystemMessageRail"
import { ReadinessSummary } from "@/components/hunter/ReadinessSummary"
import { SynchronizationStatus } from "@/components/hunter/SynchronizationStatus"
import { NextGateForecast } from "@/components/hunter/NextGateForecast"
import { minDungeonLevel } from "@/systems/dungeons/dungeonAccess"
import { systemMessageSubline } from "@/systems/messaging/systemMessagingSystem"
import { questReadyForHunt } from "./questReadyForHunt"
import type { HubView } from "./hubTypes"

interface HubMenuViewProps {
  player: PlayerContract
  hunterPortraitClass?: string
  hunterAuraClass?: string
  regularQuests: QuestContract[]
  activeDungeon: QuestContract | undefined
  readiness: ReadinessResultContract
  forecast: DungeonForecastContract | null
  systemMessage: string | null
  onSelectView: (view: HubView) => void
}

export function HubMenuView({
  player,
  hunterPortraitClass,
  hunterAuraClass,
  regularQuests,
  activeDungeon,
  readiness,
  forecast,
  systemMessage,
  onSelectView,
}: HubMenuViewProps) {
  const defaultHunt = regularQuests.find(questReadyForHunt)
  const contractCount = regularQuests.length
  const sectorOpen =
    player.level >= minDungeonLevel() || Boolean(activeDungeon)

  const menuCards = useMemo(
    () => [
      {
        id: "hunt" as const,
        title: "Active hunt",
        desc:
          defaultHunt != null
            ? `Resume ${defaultHunt.title}`
            : "No live contract — open dispatch to request deployment.",
        disabled: !defaultHunt,
        badge: defaultHunt?.type ?? "idle",
      },
      {
        id: "contracts" as const,
        title: "Contract dispatch",
        desc: `${contractCount} active · request new contracts from dispatch.`,
        disabled: false,
        badge: String(contractCount),
      },
      {
        id: "sector" as const,
        title: "Dungeon sector",
        desc: activeDungeon
          ? "Run in progress — re-enter the corridor."
          : sectorOpen
            ? "Enter a ranked corridor when ready."
            : "Unlock corridors by leveling up.",
        disabled: !sectorOpen,
        badge: activeDungeon ? "live" : "locked",
      },
    ],
    [defaultHunt, contractCount, sectorOpen, activeDungeon]
  )

  return (
    <div className="flex flex-col gap-8">
      <HunterIdentityBlock
        player={player}
        portraitClassName={hunterPortraitClass}
        auraClassName={hunterAuraClass}
      />

      {systemMessage && (
        <SystemMessageRail
          message={systemMessage}
          subline={systemMessageSubline(player)}
        />
      )}

      <ReadinessSummary readiness={readiness} />

      <SynchronizationStatus synchronization={player.synchronization} />

      {forecast && <NextGateForecast forecast={forecast} />}

      <p className="font-display text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
        Select operation
      </p>
      {menuCards.map((card) => (
        <button
          key={card.id}
          type="button"
          disabled={card.disabled}
          onClick={() => onSelectView(card.id)}
          className="group text-left disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Panel
            tone={card.disabled ? "inset" : "accent"}
            className="transition-opacity duration-200 group-hover:opacity-95 group-disabled:hover:opacity-40"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="font-display text-lg font-semibold tracking-wide text-[var(--foreground)]">
                  {card.title}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-[var(--muted)]">
                  {card.desc}
                </p>
              </div>
              <StatusChip
                label={card.badge}
                tone={card.disabled ? "neutral" : "accent"}
              />
            </div>
          </Panel>
        </button>
      ))}
    </div>
  )
}
