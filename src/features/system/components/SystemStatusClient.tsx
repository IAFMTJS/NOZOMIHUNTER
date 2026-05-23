"use client"

import { useHunterSession } from "@/features/hunter/context/HunterSessionContext"
import { HunterPage } from "@/components/layout/HunterPage"
import { HunterPageBack } from "@/components/layout/HunterPageBack"
import { PenaltyStatus } from "@/components/PenaltyStatus"
import { SystemCrest } from "@/components/ui/screen/SystemCrest"
import { StatBar } from "@/components/ui/screen/StatBar"
import { SystemMessageRail } from "@/components/hunter/SystemMessageRail"
import { selectSystemMessage, systemMessageSubline } from "@/systems/messaging/systemMessagingSystem"
import { computeReadiness } from "@/systems/readiness/readinessSystem"

export function SystemStatusClient() {
  const { player, activeQuests } = useHunterSession()

  if (!player) {
    return (
      <HunterPage>
        <p className="text-[var(--muted)]">Syncing system telemetry…</p>
      </HunterPage>
    )
  }

  const integrity = Math.max(0, 100 - player.penalties.corruption)
  const seed = `${player.id}:system`
  const message =
    selectSystemMessage({ player, activeQuests, seed }) ?? "System nominal."

  return (
    <HunterPage>
      <HunterPageBack href="/home" label="Hunter status" />
      <div className="space-y-6">
        <SystemCrest />
        <SystemMessageRail message={message} subline={systemMessageSubline(player)} />

        <StatBar
          label="System integrity"
          value={integrity}
          max={100}
          tone="accent"
        />
        <StatBar
          label="Corruption level"
          value={player.penalties.corruption}
          max={100}
          tone="danger"
        />

        <PenaltyStatus penalties={player.penalties} />

        <p className="text-xs text-[var(--muted)]">
          Readiness: {computeReadiness({ player }).survivalLabel}. Corruption increases encounter
          failure pressure per failure-design doctrine.
        </p>

      </div>
    </HunterPage>
  )
}
