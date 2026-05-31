"use client"

import type { QuestContract } from "@/contracts/quest-contract"
import type { PlayerContract } from "@/contracts/player-contract"
import type {
  DungeonExtractionChoice,
  DungeonRunContract,
  DungeonRunSummary,
  DungeonRouteNode,
  DungeonAction,
  ExplorationAction,
} from "@/contracts/dungeon-contract"
import { getDungeonBriefing } from "@/systems/dungeons/dungeonOrchestrator"
import {
  isDungeonV2Run,
  resolveBossPhaseCount,
} from "@/systems/dungeons/dungeonV2Helpers"
import { getBossPhaseSpec } from "@/systems/dungeons/dungeonBossSystem"
import { bossPhaseBannerCopy } from "@/systems/presentation/dungeonBossPresentation"
import { bossDisplayName } from "@/systems/dungeons/dungeonMasterSystem"
import { VocabularyEncounter } from "@/features/quests/components/VocabularyEncounter"
import { ConversationEncounter } from "@/features/conversation/components/ConversationEncounter"
import { SpeechEncounter } from "@/features/speech/components/SpeechEncounter"
import { ListeningEncounter } from "@/features/dungeons/components/ListeningEncounter"
import { DungeonRouteMap } from "@/features/dungeons/components/DungeonRouteMap"
import { DungeonActionBar } from "@/features/dungeons/components/DungeonActionBar"
import { ExtractionDecisionPanel } from "@/features/dungeons/components/ExtractionDecisionPanel"
import { DungeonRunRecap } from "@/features/dungeons/components/DungeonRunRecap"
import { BossPhaseBanner } from "@/features/dungeons/components/BossPhaseBanner"
import { BossPhaseOverlay } from "@/features/dungeons/components/BossPhaseOverlay"
import { BossEncounterHUD } from "@/features/dungeons/components/BossEncounterHUD"
import { BossIntroPanel } from "@/components/dungeons/BossIntroPanel"
import { CorridorStage } from "@/features/dungeons/components/CorridorStage"
import { SectorRewardInterstitial } from "@/features/dungeons/components/SectorRewardInterstitial"
import { DungeonClearCeremonyFlow } from "@/components/ceremonies/DungeonClearCeremonyFlow"
import { buildDungeonClearFromRun } from "@/systems/presentation/ceremonies/dungeonClearCeremonyData"
import { Panel } from "@/components/ui/Panel"
import { Button } from "@/components/ui/Button"
import type { ExtractionMasteryEntry } from "@/systems/dungeons/dungeonLexiconRecapSystem"

export interface DungeonRunnerEncounterBodyProps {
  quest: QuestContract
  run: DungeonRunContract
  player?: PlayerContract | null
  disabled?: boolean
  isV2: boolean
  state: DungeonRunContract["machineState"]
  routeChoices: DungeonRouteNode[]
  systemLine: string | null
  replayCap: number
  maxWrongAttempts?: number
  signalDegraded?: boolean
  missingEncounterPayload: boolean
  extractionRecap: ExtractionMasteryEntry[]
  runSummary: DungeonRunSummary | null
  wrap: <T>(fn: () => Promise<T>, okMsg?: string) => Promise<T | undefined>
  onExplorationError: (message: string) => void
  onDeploy: () => Promise<void>
  onAdvanceExploration: (action: ExplorationAction) => Promise<void>
  onEngageSector: () => Promise<void>
  onContinueReward: () => Promise<void>
  onCompleteSpecialRoom: () => Promise<void>
  onChooseRoute: (exitId: string) => Promise<void>
  onSelectCombatAction: (action: DungeonAction) => Promise<void>
  onExtractionChoice: (choice: DungeonExtractionChoice) => Promise<void>
  onExtract: () => Promise<void>
  onSubmitAnswer: (answer: string) => Promise<void>
  onSendMessage: (message: string) => Promise<void>
  onSubmitSpeech: (transcript: string, ms: number) => Promise<void>
  onSubmitListening: (answer: string) => Promise<void>
  onListeningReplay?: () => Promise<void>
  onAbandon: () => Promise<void>
  onExtractionStatus: (message: string) => void
  timeRemainingMs?: number | null
}

export function DungeonRunnerEncounterBody({
  quest,
  run,
  player,
  disabled,
  isV2,
  state,
  routeChoices,
  systemLine,
  replayCap,
  maxWrongAttempts,
  signalDegraded,
  missingEncounterPayload,
  extractionRecap,
  runSummary,
  wrap,
  onExplorationError,
  onDeploy,
  onAdvanceExploration,
  onEngageSector,
  onContinueReward,
  onCompleteSpecialRoom,
  onChooseRoute,
  onSelectCombatAction,
  onExtractionChoice,
  onExtract,
  onSubmitAnswer,
  onSendMessage,
  onSubmitSpeech,
  onSubmitListening,
  onListeningReplay,
  onAbandon,
  onExtractionStatus,
  timeRemainingMs,
}: DungeonRunnerEncounterBodyProps) {
  const boss = run.dungeon.boss
  const v2 = isV2 && isDungeonV2Run(run)

  return (
    <>
      {state === "PREPARATION" && (
        <div className="nozomi-dungeon-deploy flex flex-col gap-4 p-1">
          <p className="text-sm leading-relaxed text-[var(--muted)]">
            {getDungeonBriefing(quest)}
          </p>
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--accent-bright)]">
            Corridor synchronized — awaiting deployment
          </p>
          <Button
            disabled={disabled}
            className="w-full shadow-[0_0_20px_var(--glow-accent)]"
            onClick={() => wrap(onDeploy, "Deployed into sector grid.")}
          >
            Deploy to sector
          </Button>
        </div>
      )}

      {state === "EXPLORATION" && v2 && run.routeSelectPending && (
        <DungeonRouteMap
          choices={routeChoices}
          disabled={disabled}
          archiveFog={run.activeModifier?.archiveFogOnScan}
          onChoose={(id) => wrap(() => onChooseRoute(id), "Route locked.")}
        />
      )}

      {state === "EXPLORATION" && (!v2 || !run.routeSelectPending) && (
        <CorridorStage
          run={run}
          disabled={disabled}
          statusLine={systemLine}
          onAdvance={async (action) => {
            try {
              await onAdvanceExploration(action)
            } catch (e) {
              const msg =
                e instanceof Error ? e.message : "Exploration advance failed"
              onExplorationError(msg)
              throw e
            }
          }}
          onEngage={() => wrap(onEngageSector, "Sector engaged.")}
        />
      )}

      {state === "REWARD" && v2 && run.routeSelectPending && (
        <>
          <SectorRewardInterstitial
            quest={quest}
            disabled={disabled}
            onContinue={() => wrap(onContinueReward)}
          />
          <DungeonRouteMap
            choices={routeChoices}
            disabled={disabled}
            archiveFog={run.activeModifier?.archiveFogOnScan}
            onChoose={(id) => wrap(() => onChooseRoute(id), "Route locked.")}
          />
        </>
      )}

      {state === "REWARD" && (!v2 || !run.routeSelectPending) && (
        <SectorRewardInterstitial
          quest={quest}
          disabled={disabled}
          onContinue={() => wrap(onContinueReward, "Pushing deeper...")}
        />
      )}

      {v2 && (state === "ENCOUNTER" || state === "BOSS") && run.activeType === "VOCAB" && (
        <DungeonActionBar
          playerLevel={player?.level ?? 1}
          selected={run.selectedDungeonAction}
          disabled={disabled}
          onSelect={onSelectCombatAction}
        />
      )}

      {state === "ENCOUNTER" && run.activeType === "VOCAB" && (
        <VocabularyEncounter
          quest={quest}
          player={player}
          disabled={disabled}
          onSubmit={onSubmitAnswer}
          onAbandon={onAbandon}
        />
      )}

      {state === "ENCOUNTER" && run.activeType === "LISTENING" && (
        <ListeningEncounter
          quest={quest}
          player={player}
          disabled={disabled}
          maxWrongAttempts={maxWrongAttempts}
          maxReplays={replayCap}
          signalDegraded={signalDegraded}
          focusMode
          onSubmit={onSubmitListening}
          onReplayPenalty={onListeningReplay}
          onAbandon={onAbandon}
        />
      )}

      {state === "ENCOUNTER" && run.activeType === "NPC" && (
        <ConversationEncounter
          quest={quest}
          disabled={disabled}
          onSend={async (msg) => {
            await onSendMessage(msg)
            return {
              passed: true,
              encounterFailed: false,
              feedback: "Transmission logged.",
            }
          }}
          onAbandon={onAbandon}
        />
      )}

      {state === "ENCOUNTER" && run.activeType === "SPEECH" && (
        <SpeechEncounter
          quest={quest}
          player={player}
          disabled={disabled}
          onSubmit={onSubmitSpeech}
          onAbandon={onAbandon}
        />
      )}

      {state === "ENCOUNTER" && run.activeType === null && systemLine && (
        <Panel tone="default" className="mt-3 border-[var(--accent)]/30">
          <p className="text-sm leading-relaxed text-[var(--foreground)]">{systemLine}</p>
          <Button
            className="mt-4 w-full"
            disabled={disabled}
            onClick={() => wrap(onCompleteSpecialRoom, "Sector beat acknowledged.")}
          >
            Continue
          </Button>
        </Panel>
      )}

      {missingEncounterPayload && (
        <Panel tone="danger" className="mt-3 border-[var(--danger)]/40">
          <p className="text-sm text-[var(--muted)]">
            Encounter payload desynchronized after resume. Recover the run to continue.
          </p>
          <Button
            className="mt-3 w-full"
            disabled={disabled}
            onClick={() =>
              wrap(onContinueReward, "Run state recovered. Continue corridor routing.")
            }
          >
            Recover run state
          </Button>
        </Panel>
      )}

      {state === "BOSS" && v2 && <BossPhaseOverlay quest={quest} run={run} />}

      {state === "BOSS" && v2 && run.bossPhase === 0 && <BossIntroPanel run={run} />}

      {state === "BOSS" && (
        <Panel tone="boss" className="nozomi-boss-frame relative border-[var(--danger)]/40">
          {v2 && (
            <BossEncounterHUD
              run={run}
              bossName={boss?.name ?? "Warden"}
              timeRemainingMs={timeRemainingMs}
            />
          )}
          {v2 && (
            <BossPhaseBanner
              copy={bossPhaseBannerCopy(
                bossDisplayName(run),
                getBossPhaseSpec(quest, run.bossPhase),
                run.bossPhase,
                resolveBossPhaseCount(run)
              )}
            />
          )}
          <p className="mb-1 text-[10px] uppercase tracking-[0.28em] text-[var(--danger)]">
            Warden encounter
          </p>
          <p className="mb-4 font-display text-lg text-[var(--foreground)]">
            {boss?.name ?? "Boss"} — phase {run.bossPhase + 1} /{" "}
            {resolveBossPhaseCount(run)}
          </p>
          {v2 && quest.vocabularyEncounter && (
            <DungeonActionBar
              playerLevel={player?.level ?? 1}
              selected={run.selectedDungeonAction}
              disabled={disabled}
              onSelect={onSelectCombatAction}
            />
          )}
          {(run.bossPhase === 0 || (v2 && quest.vocabularyEncounter)) &&
            quest.vocabularyEncounter && (
              <VocabularyEncounter
                quest={quest}
                player={player}
                disabled={disabled}
                onSubmit={onSubmitAnswer}
                onAbandon={onAbandon}
              />
            )}
          {run.bossPhase >= 1 && !quest.vocabularyEncounter && quest.listeningEncounter && (
            <ListeningEncounter
              quest={quest}
              player={player}
              disabled={disabled}
              maxWrongAttempts={maxWrongAttempts}
              maxReplays={replayCap}
              signalDegraded={signalDegraded}
              focusMode
              onSubmit={onSubmitListening}
              onReplayPenalty={onListeningReplay}
              onAbandon={onAbandon}
            />
          )}
          {run.bossPhase >= 1 &&
            !quest.vocabularyEncounter &&
            !quest.listeningEncounter &&
            quest.speechEncounter && (
              <SpeechEncounter
                quest={quest}
                player={player}
                disabled={disabled}
                onSubmit={onSubmitSpeech}
                onAbandon={onAbandon}
              />
            )}
        </Panel>
      )}

      {state === "EXTRACTION" && run.extractionChoicePending && (
        <ExtractionDecisionPanel
          disabled={disabled}
          onChoose={(choice) => wrap(() => onExtractionChoice(choice))}
        />
      )}

      {state === "EXTRACTION" && player && !run.extractionChoicePending && (
        <DungeonClearCeremonyFlow
          data={buildDungeonClearFromRun(
            quest,
            {
              xpGained: quest.rewards.xp,
              items: [],
              claimed: false,
              questId: quest.id,
            },
            player,
            { masteryRecap: extractionRecap }
          )}
          theme={run.dungeon.theme}
          player={player}
          disabled={disabled}
          onExtract={async () => {
            await onExtract()
            onExtractionStatus("Extraction complete.")
          }}
        />
      )}

      {state === "EXTRACTION" && !run.extractionChoicePending && runSummary && (
        <DungeonRunRecap summary={runSummary} />
      )}
    </>
  )
}
