"use client"

import Link from "next/link"
import type { PlayerContract } from "@/contracts/player-contract"
import { profileSummary } from "@/features/profile/profilePresentation"
import { XPBar } from "@/components/XPBar"
import { PenaltyStatus } from "@/components/PenaltyStatus"
import { Panel } from "@/components/ui/Panel"
import { HeroBanner } from "@/components/ui/screen/HeroBanner"
import { CollapsibleSection } from "@/components/ui/screen/CollapsibleSection"
import { xpProgressInCurrentLevel } from "@/systems/progression/levelSystem"
import { HunterIdentityBlock } from "@/components/hunter/HunterIdentityBlock"
import { ReadinessSummary } from "@/components/hunter/ReadinessSummary"
import { SynchronizationStatus } from "@/components/hunter/SynchronizationStatus"
import { computeReadiness } from "@/systems/readiness/readinessSystem"
import { computeHunterPower } from "@/systems/power/hunterPowerSystem"
import { getHunterPresentation } from "@/systems/presentation/hunterPresentationSystem"
import {
  selectSystemMessage,
  systemMessageSubline,
} from "@/systems/messaging/systemMessagingSystem"
import { SystemMessageRail } from "@/components/hunter/SystemMessageRail"

interface HunterProfilePanelProps {
  player: PlayerContract
}

export function HunterProfilePanel({ player }: HunterProfilePanelProps) {
  const progress = xpProgressInCurrentLevel(player.xp, player.level)
  const { systems, dungeons, titles } = profileSummary(player)
  const readiness = computeReadiness({ player })
  const power = computeHunterPower(player)
  const presentation = getHunterPresentation(player)
  const today = new Date().toISOString().slice(0, 10)
  const systemMessage = selectSystemMessage({
    player,
    activeQuests: [],
    seed: `${player.id}:${today}:profile`,
  })

  return (
    <div className="space-y-6">
      <Panel tone="accent" className="nozomi-screen-prep space-y-0 overflow-hidden !p-0">
        <HeroBanner title={player.identity.codename} rankLabel={player.rank} tall />
        <div className="space-y-6 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--accent-bright)]">
            Hunter dossier
          </p>

          <HunterIdentityBlock
            player={player}
            portraitClassName={presentation.portraitClass}
            auraClassName={presentation.identityAuraClass}
          />

          {systemMessage && (
            <SystemMessageRail
              message={systemMessage}
              subline={systemMessageSubline(player)}
            />
          )}

          <SynchronizationStatus synchronization={player.synchronization} />
          <ReadinessSummary readiness={readiness} />
        </div>
      </Panel>

      <XPBar
        currentXP={progress.current}
        requiredXP={progress.required}
        level={player.level}
        xpDebt={player.penalties.xpDebt}
      />

      <PenaltyStatus penalties={player.penalties} />

      <Panel tone="default" id="operator-metrics" className="nozomi-embedded">
        <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">
          Operator metrics
        </h2>
        <dl className="mt-3 flex flex-col gap-3 text-sm">
          {(
            [
              ["Vocabulary", player.stats.vocabulary],
              ["Grammar", player.stats.grammar],
              ["Listening", player.stats.listening],
              ["Speaking", player.stats.speaking],
              ["Confidence", player.stats.confidence],
              ["Consistency", player.stats.consistency],
            ] as const
          ).map(([label, value]) => (
            <div key={label}>
              <dt className="text-[var(--muted)]">{label}</dt>
              <dd className="font-medium text-[var(--foreground)]">{value}</dd>
            </div>
          ))}
        </dl>

        <ul className="mt-6 space-y-2 border-t border-[var(--border-subtle)] pt-4 text-sm">
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
            <span className="tabular-nums text-[var(--reward)]">{power.total}</span>
          </li>
        </ul>
      </Panel>

      <Panel tone="inset" className="nozomi-embedded">
        <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">
          Unlocked systems
        </h2>
        <ul className="mt-3 space-y-1 text-sm text-[var(--muted)]">
          {systems.map((s) => (
            <li key={s.key}>{s.label}</li>
          ))}
        </ul>
      </Panel>

      <Panel tone="inset" className="nozomi-embedded">
        <h2 className="font-display text-lg font-semibold text-[var(--foreground)]">
          Corridors
        </h2>
        <ul className="mt-3 space-y-1 text-sm text-[var(--muted)]">
          {dungeons.map((d) => (
            <li key={d.key}>{d.label}</li>
          ))}
        </ul>
      </Panel>

      {titles.length > 0 && (
        <Panel tone="inset" className="nozomi-embedded">
          <CollapsibleSection title="Registry titles" count={titles.length} defaultOpen>
            <ul className="space-y-1 text-sm text-[var(--muted)]">
              {titles.map((t) => (
                <li key={t.key}>{t.label}</li>
              ))}
            </ul>
          </CollapsibleSection>
        </Panel>
      )}

      <Link
        href="/home"
        className="inline-flex text-sm text-[var(--accent-bright)] hover:underline"
      >
        ← Hunter status
      </Link>
    </div>
  )
}
