"use client"

import { useState } from "react"
import type { QuestContract } from "@/contracts/quest-contract"
import type { PlayerContract } from "@/contracts/player-contract"
import { HubScreenFrame } from "@/components/layout/HubScreenFrame"
import { SectorMapRail } from "@/components/dungeons/SectorMapRail"
import { DungeonRunner } from "@/features/dungeons/components/DungeonRunner"
import { resolveDungeonDeployAdvisory } from "@/systems/dungeons/dungeonSectorMapSystem"
import type { SectorMapNode } from "@/systems/dungeons/dungeonSectorMapSystem"
import { HubBack } from "./HubBack"
import { QuestBoostActions } from "@/features/inventory/components/QuestBoostActions"
import { hasEscapeBeacon } from "@/systems/economy/boostSystem"
import { ConfirmDeployDialog } from "@/components/preparation/ConfirmDeployDialog"
import type { ContractHubProps, PenaltyMods } from "./hubTypes"

interface HubSectorViewProps {
  player: PlayerContract
  activeQuests: QuestContract[]
  activeDungeon: QuestContract | undefined
  dungeonBusy: boolean
  dungeonError: string | null
  dungeonMessage: string | null
  dungeonExplorationLine?: string | null
  encounterClassName: string
  penaltyMods: PenaltyMods
  sectorMap: SectorMapNode[]
  onBack: () => void
  onEnterDungeon: (key: string) => void
  props: ContractHubProps
}

export function HubSectorView({
  player,
  activeQuests,
  activeDungeon,
  dungeonBusy,
  dungeonError,
  dungeonMessage,
  dungeonExplorationLine,
  encounterClassName,
  penaltyMods,
  sectorMap,
  onBack,
  onEnterDungeon,
  props,
}: HubSectorViewProps) {
  const [corridorNotice, setCorridorNotice] = useState<string | null>(null)
  const [pendingDeployKey, setPendingDeployKey] = useState<string | null>(null)
  const [deployWarning, setDeployWarning] = useState<string | null>(null)

  function handleEnterCorridor(dungeonKey: string) {
    const advisory = resolveDungeonDeployAdvisory(player, activeQuests, dungeonKey)
    if (!advisory.allowed) {
      setCorridorNotice(advisory.warning ?? "Access denied.")
      return
    }
    if (advisory.warning) {
      setDeployWarning(advisory.warning)
      setPendingDeployKey(dungeonKey)
      return
    }
    setCorridorNotice(null)
    onEnterDungeon(dungeonKey)
  }

  function confirmDeploy() {
    if (!pendingDeployKey) return
    setCorridorNotice(null)
    onEnterDungeon(pendingDeployKey)
    setPendingDeployKey(null)
    setDeployWarning(null)
  }

  return (
    <>
      <HubBack onBack={onBack} label="Hunter status" operationCode="OP-SECTOR" />

      {!activeDungeon && (
        <HubScreenFrame
          variant="sector"
          title="Dungeon sector"
          subtitle="Vertical breach map. Deeper corridors require extraction and readiness."
        >
          {corridorNotice && (
            <p className="text-sm text-[var(--danger)]">{corridorNotice}</p>
          )}
          <SectorMapRail
            nodes={sectorMap}
            disabled={dungeonBusy}
            onSelectCorridor={handleEnterCorridor}
          />
        </HubScreenFrame>
      )}

      {dungeonError && (
        <p className="mb-4 text-sm text-[var(--danger)]">{dungeonError}</p>
      )}
      {dungeonMessage && (
        <p className="mb-4 text-sm text-[var(--muted)]">{dungeonMessage}</p>
      )}

      {activeDungeon ? (
        <HubScreenFrame
          variant="sector"
          title="Corridor run"
          subtitle="Breach map active. Extract before corruption maxes out."
        >
          <DungeonRunner
            quest={activeDungeon}
            player={player}
            disabled={dungeonBusy}
            encounterClassName={encounterClassName}
            maxWrongAttempts={penaltyMods.maxWrongAttempts}
            maxListeningReplays={penaltyMods.maxListeningReplays}
            signalDegraded={penaltyMods.signalDegraded}
            onDeploy={props.onDungeonDeploy}
            onAdvanceExploration={props.onDungeonAdvanceExploration}
            onEngageSector={props.onDungeonEngageSector}
            onContinueReward={props.onDungeonContinueReward}
            onCompleteSpecialRoom={props.onDungeonCompleteSpecialRoom}
            onChooseRoute={props.onDungeonChooseRoute}
            onSelectCombatAction={props.onDungeonSelectCombatAction}
            onExtractionChoice={props.onDungeonExtractionChoice}
            explorationLine={dungeonExplorationLine}
            onExtract={props.onDungeonExtract}
            onSubmitAnswer={props.onDungeonSubmitAnswer}
            onSubmitListening={props.onDungeonSubmitListening}
            onListeningReplay={props.onDungeonListeningReplay}
            onSendMessage={props.onDungeonSendMessage}
            onSubmitSpeech={props.onDungeonSubmitSpeech}
            onAbandon={props.onDungeonAbandon}
            escapeBeaconActive={hasEscapeBeacon(player)}
          />
          <QuestBoostActions
            player={player}
            userId={player.id}
            quest={activeDungeon}
          />
        </HubScreenFrame>
      ) : null}

      <ConfirmDeployDialog
        open={pendingDeployKey != null}
        title="Deployment advisory"
        message={
          deployWarning
            ? `${deployWarning}\n\nProceed with deployment?`
            : "Proceed with deployment?"
        }
        onCancel={() => {
          setPendingDeployKey(null)
          setDeployWarning(null)
        }}
        onConfirm={confirmDeploy}
      />
    </>
  )
}
