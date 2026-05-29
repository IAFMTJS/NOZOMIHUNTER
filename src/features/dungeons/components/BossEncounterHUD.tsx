"use client"

import type { DungeonRunContract } from "@/contracts/dungeon-contract"
import {
  bossVitalityCurrent,
  bossVitalityMaxForPhase,
} from "@/systems/dungeons/bossVitalitySystem"
import { runCorruptionPercent } from "@/systems/presentation/corruptionPresentationSystem"
import { corruptionBandCssClass, corruptionBandFromPercent } from "@/config/corruptionThresholds"
import { GameAssetImage } from "@/components/ui/GameAssetImage"

interface BossEncounterHUDProps {
  run: DungeonRunContract
  bossName?: string
  timeRemainingMs?: number | null
}

function formatTimer(ms: number | null | undefined): string | null {
  if (ms == null) return null
  const s = Math.max(0, Math.ceil(ms / 1000))
  const m = Math.floor(s / 60)
  const r = s % 60
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`
}

export function BossEncounterHUD({
  run,
  bossName = "Warden",
  timeRemainingMs,
}: BossEncounterHUDProps) {
  const max = bossVitalityMaxForPhase(run)
  const current = bossVitalityCurrent(run)
  const timer = formatTimer(timeRemainingMs)
  const corruption = runCorruptionPercent(run.sectorCorruption, run.threat?.corruptionPressure)
  const bandClass = corruptionBandCssClass(corruptionBandFromPercent(corruption))

  const bossAssetKey =
    run.dungeon.theme === "SHADOW_ARCHIVE"
      ? "boss.shadow-archivist"
      : run.dungeon.theme === "ABYSS_CORE"
        ? "boss.void-priest"
        : "boss.neon-warden"

  return (
    <div
      className={`nozomi-boss-hud nozomi-vfx-boss-frame relative mb-3 space-y-2 overflow-hidden rounded-lg border border-[var(--danger)]/30 p-3 ${bandClass}`}
    >
      <div className="pointer-events-none absolute inset-0 opacity-25">
        <GameAssetImage assetKey={bossAssetKey} alt="" fill className="object-cover" />
      </div>
      <div className="relative z-[1] flex items-center justify-between gap-2">
        <p className="font-display text-sm uppercase tracking-wider text-[var(--foreground)]">
          {bossName}
        </p>
        <p className="font-mono text-xs tabular-nums text-[var(--danger)]">
          {current}% integrity
        </p>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[var(--surface)]">
        <div
          className="h-full bg-[var(--danger)] transition-all duration-300"
          style={{ width: `${max > 0 ? (current / max) * 100 : 0}%` }}
        />
      </div>
      <div className="flex justify-between text-[10px] uppercase tracking-wider text-[var(--muted)]">
        <span>Corruption {corruption}%</span>
        <span>
          Phase {(run.bossPhase ?? 0) + 1}
          {timer != null && <span className="ml-2 text-[var(--danger)]">{timer}</span>}
        </span>
      </div>
    </div>
  )
}
