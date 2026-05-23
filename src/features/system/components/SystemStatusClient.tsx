"use client"

import Link from "next/link"
import { useHunterSession } from "@/features/hunter/context/HunterSessionContext"
import { HunterPage } from "@/components/layout/HunterPage"
import { HunterPageBack } from "@/components/layout/HunterPageBack"
import { PenaltyStatus } from "@/components/PenaltyStatus"
import { SystemMessageRail } from "@/components/hunter/SystemMessageRail"
import { selectSystemMessage, systemMessageSubline } from "@/systems/messaging/systemMessagingSystem"
import { computeReadiness } from "@/systems/readiness/readinessSystem"

export function SystemStatusClient() {
  const { player, activeQuests, hunterPresentation } = useHunterSession()

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
        <SystemMessageRail message={message} subline={systemMessageSubline(player)} />

        <div>
          <div className="mb-2 flex justify-between text-xs uppercase tracking-widest text-[var(--muted)]">
            <span>System integrity</span>
            <span>{integrity}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-black/50">
            <div
              className="h-full rounded-full bg-[var(--accent)]"
              style={{ width: `${integrity}%` }}
            />
          </div>
        </div>

        <PenaltyStatus penalties={player.penalties} />

        <p className="text-xs text-[var(--muted)]">
          Readiness: {computeReadiness({ player }).survivalLabel}. Corruption increases encounter
          failure pressure per failure-design doctrine.
        </p>

      </div>
    </HunterPage>
  )
}
