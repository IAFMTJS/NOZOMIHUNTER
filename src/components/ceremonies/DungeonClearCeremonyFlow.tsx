"use client"

import { useState } from "react"
import { CeremonyOverlay } from "@/components/ceremonies/CeremonyOverlay"
import { BossCollapsePhase } from "@/components/ceremonies/BossCollapsePhase"
import { DungeonClearCeremony } from "@/components/ceremonies/DungeonClearCeremony"
import { XPBar } from "@/components/XPBar"
import { triggerMomentFreeze } from "@/systems/presentation/momentFreezeSystem"
import { hapticForCeremony } from "@/systems/presentation/hapticsSystem"
import type { DungeonClearCeremonyViewModel } from "@/systems/presentation/ceremonies/ceremonyTypes"
import type { DungeonTheme } from "@/contracts/dungeon-contract"
import type { PlayerContract } from "@/contracts/player-contract"
import { xpProgressInCurrentLevel } from "@/systems/progression/levelSystem"

interface DungeonClearCeremonyFlowProps {
  data: DungeonClearCeremonyViewModel
  theme?: DungeonTheme
  player: PlayerContract
  disabled?: boolean
  onExtract: () => Promise<void>
}

export function DungeonClearCeremonyFlow({
  data,
  theme,
  player,
  disabled,
  onExtract,
}: DungeonClearCeremonyFlowProps) {
  const [phase, setPhase] = useState<"collapse" | "results">("collapse")

  const progress = xpProgressInCurrentLevel(player.level, player.xp + data.xpGained)

  if (phase === "collapse") {
    return (
      <CeremonyOverlay open intensity="slam" ariaLabelledBy="dungeon-collapse">
        <BossCollapsePhase
          theme={theme}
          onComplete={() => {
            triggerMomentFreeze(400)
            hapticForCeremony("dungeonClear")
            setPhase("results")
          }}
        />
      </CeremonyOverlay>
    )
  }

  return (
    <CeremonyOverlay open intensity="slam" ariaLabelledBy="dungeon-clear-title">
      <DungeonClearCeremony
        data={data}
        theme={theme}
        disabled={disabled}
        onExtract={onExtract}
      />
      <div className="mx-auto mt-4 max-w-xs text-left">
        <XPBar
          level={player.level}
          currentXP={progress.current}
          requiredXP={progress.required}
          xpDebt={player.penalties?.xpDebt}
        />
      </div>
    </CeremonyOverlay>
  )
}
