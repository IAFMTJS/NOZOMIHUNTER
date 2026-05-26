"use client"

import { useState, useEffect, useMemo } from "react"
import type { QuestContract } from "@/contracts/quest-contract"
import type { PlayerContract } from "@/contracts/player-contract"
import {
  dungeonTimeRemaining,
} from "@/systems/economy/shopEffectSystem"
import { hasReplayBan } from "@/systems/dungeons/dungeonModifierSystem"
import { VocabularyEncounter } from "@/features/quests/components/VocabularyEncounter"
import { ConversationEncounter } from "@/features/conversation/components/ConversationEncounter"
import { SpeechEncounter } from "@/features/speech/components/SpeechEncounter"
import { ListeningEncounter } from "./ListeningEncounter"
import {
  getDungeonBriefing,
  listRouteChoices,
} from "@/systems/dungeons/dungeonOrchestrator"
import {
  isDungeonV2Run,
  resolveBossPhaseCount,
} from "@/systems/dungeons/dungeonV2Helpers"
import { getBossPhaseSpec } from "@/systems/dungeons/dungeonBossSystem"
import { bossPhaseBannerCopy } from "@/systems/presentation/dungeonBossPresentation"
import { buildDungeonRunSummary } from "@/systems/dungeons/dungeonRunSummarySystem"
import { DungeonThreatHud } from "@/features/dungeons/components/DungeonThreatHud"
import { DungeonRouteMap } from "@/features/dungeons/components/DungeonRouteMap"
import { DungeonActionBar } from "@/features/dungeons/components/DungeonActionBar"
import { DungeonModifierRail } from "@/features/dungeons/components/DungeonModifierRail"
import { ExtractionDecisionPanel } from "@/features/dungeons/components/ExtractionDecisionPanel"
import { DungeonRunRecap } from "@/features/dungeons/components/DungeonRunRecap"
import { BossPhaseBanner } from "@/features/dungeons/components/BossPhaseBanner"
import { DungeonMasterPresence } from "@/features/dungeons/components/DungeonMasterPresence"
import { BossPhaseOverlay } from "@/features/dungeons/components/BossPhaseOverlay"
import { BossIntegrityBar } from "@/features/dungeons/components/BossIntegrityBar"
import { bossDisplayName } from "@/systems/dungeons/dungeonMasterSystem"
import type { DungeonAction, DungeonExtractionChoice } from "@/contracts/dungeon-contract"
import { Panel } from "@/components/ui/Panel"
import { Button } from "@/components/ui/Button"
import { DungeonPhaseStepper } from "@/components/ui/DungeonPhaseStepper"
import { DungeonCorridorRail } from "@/components/ui/DungeonCorridorRail"
import { EncounterFocusShell } from "@/components/ui/EncounterFocusShell"
import { CorridorStage } from "@/features/dungeons/components/CorridorStage"
import { DungeonRunShell } from "@/features/dungeons/components/DungeonRunShell"
import { DungeonRunHud } from "@/features/dungeons/components/DungeonRunHud"
import { SectorRewardInterstitial } from "@/features/dungeons/components/SectorRewardInterstitial"
import { DungeonClearCeremonyFlow } from "@/components/ceremonies/DungeonClearCeremonyFlow"
import { buildDungeonClearFromRun } from "@/systems/presentation/ceremonies/dungeonClearCeremonyData"
import {
  encounterTypeGlyph,
  sectorNodeLabel,
} from "@/systems/dungeons/dungeonPresentationSystem"
import type { ExplorationAction } from "@/contracts/dungeon-contract"
import { getMasteryMap } from "@/systems/mastery/masterySystem"
import { getVocabularyCatalog } from "@/systems/mastery/vocabularyCatalog"
import { buildExtractionMasteryRecap } from "@/systems/dungeons/dungeonLexiconRecapSystem"
import { EncounterFeedbackProvider } from "@/features/encounters/context/EncounterFeedbackContext"
import { EncounterFeedbackBridge } from "@/features/encounters/EncounterFeedbackBridge"

interface DungeonRunnerProps {
  quest: QuestContract
  player?: PlayerContract | null
  disabled?: boolean
  encounterClassName?: string
  maxWrongAttempts?: number
  maxListeningReplays?: number
  signalDegraded?: boolean
  onDeploy: () => Promise<void>
  onAdvanceExploration: (action: ExplorationAction) => Promise<void>
  onEngageSector: () => Promise<void>
  onContinueReward: () => Promise<void>
  onChooseRoute: (exitId: string) => Promise<void>
  onSelectCombatAction: (action: DungeonAction) => Promise<void>
  onExtractionChoice: (choice: DungeonExtractionChoice) => Promise<void>
  explorationLine?: string | null
  onExtract: () => Promise<void>
  onSubmitAnswer: (answer: string) => Promise<void>
  onSendMessage: (message: string) => Promise<void>
  onSubmitSpeech: (transcript: string, ms: number) => Promise<void>
  onSubmitListening: (answer: string) => Promise<void>
  onListeningReplay?: () => Promise<void>
  onAbandon: () => Promise<void>
  escapeBeaconActive?: boolean
}

export function DungeonRunner({
  quest,
  player,
  disabled,
  encounterClassName = "",
  maxWrongAttempts,
  maxListeningReplays = 3,
  signalDegraded,
  onDeploy,
  onAdvanceExploration,
  onEngageSector,
  onContinueReward,
  onChooseRoute,
  onSelectCombatAction,
  onExtractionChoice,
  explorationLine,
  onExtract,
  onSubmitAnswer,
  onSendMessage,
  onSubmitSpeech,
  onSubmitListening,
  onListeningReplay,
  onAbandon,
  escapeBeaconActive,
}: DungeonRunnerProps) {
  const [status, setStatus] = useState<string | null>(null)
  const [timeRemainingMs, setTimeRemainingMs] = useState<number | null>(null)
  const run = quest.dungeonRun

  useEffect(() => {
    if (!run?.runStartedAt || !run.timeLimitMs) {
      setTimeRemainingMs(null)
      return
    }
    const tick = () => setTimeRemainingMs(dungeonTimeRemaining(run))
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [run?.runStartedAt, run?.timeLimitMs, run?.frozenTimeMs, run?.frozenUntil, run])

  const extractionRecap = useMemo(() => {
    const ids = run?.stabilizedWordIds ?? []
    if (ids.length === 0) return []
    const catalog = getVocabularyCatalog()
    return buildExtractionMasteryRecap(ids, getMasteryMap(), (id) => {
      const entry = catalog.byId.get(id)
      return entry
        ? {
            japanese: entry.japanese[0] ?? entry.japanese.join(""),
            meanings: entry.meanings,
          }
        : null
    })
  }, [run?.stabilizedWordIds])

  const isV2 = run != null && isDungeonV2Run(run)
  const routeChoices = useMemo(
    () => (run && isV2 ? listRouteChoices(run) : []),
    [isV2, run]
  )

  const runSummary = useMemo(() => {
    if (!run || !isV2) return null
    const catalog = getVocabularyCatalog()
    return buildDungeonRunSummary(run, getMasteryMap(), (id) => {
      const entry = catalog.byId.get(id)
      return entry
        ? {
            japanese: entry.japanese[0] ?? entry.japanese.join(""),
            meanings: entry.meanings,
          }
        : null
    }, run.dungeon.boss?.name)
  }, [isV2, run])

  if (!run) return null

  const boss = run.dungeon.boss
  const encounters = run.dungeon.encounters
  const sectorsDone = encounters.filter((e) => e.completed).length
  const sectorTotal = encounters.length
  const activeSectorIndex = encounters.findIndex((e) => !e.completed)
  const state = run.machineState
  const inEncounter =
    state === "ENCOUNTER" || state === "BOSS" || state === "REWARD"
  const systemLine =
    explorationLine ?? run.explorationSystemLine ?? null
  const replayCap = hasReplayBan(run.modifiers) ? 1 : maxListeningReplays

  async function wrap<T>(fn: () => Promise<T>, okMsg?: string): Promise<T | undefined> {
    try {
      const result = await fn()
      if (okMsg) setStatus(okMsg)
      return result
    } catch (e) {
      const message = e instanceof Error ? e.message : "Dungeon action failed"
      if (message.includes("Invalid dungeon transition")) {
        setStatus("Route sync mismatch resolved. Choose route again.")
      } else {
        setStatus(message)
      }
      return undefined
    }
  }

  const corridorSectors = encounters.map((e, i) => ({
    id: e.id,
    label: sectorNodeLabel(i, e.type, e.completed),
    glyph: encounterTypeGlyph(e.type),
    completed: e.completed,
    current:
      !e.completed &&
      i === activeSectorIndex &&
      (state === "ENCOUNTER" || state === "EXPLORATION" || state === "REWARD"),
    explorationProgress:
      !e.completed && i === activeSectorIndex && state === "EXPLORATION"
        ? run.explorationProgress
        : undefined,
  }))

  const encounterBody = (
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

      {state === "EXPLORATION" && isV2 && run.routeSelectPending && (
        <DungeonRouteMap
          choices={routeChoices}
          disabled={disabled}
          archiveFog={run.activeModifier?.archiveFogOnScan}
          onChoose={(id) => wrap(() => onChooseRoute(id), "Route locked.")}
        />
      )}

      {state === "EXPLORATION" && (!isV2 || !run.routeSelectPending) && (
        <CorridorStage
          run={run}
          disabled={disabled}
          statusLine={systemLine}
          onAdvance={async (action) => {
            try {
              await onAdvanceExploration(action)
            } catch (e) {
              const msg = e instanceof Error ? e.message : "Exploration advance failed"
              setStatus(msg)
              throw e
            }
          }}
          onEngage={() => wrap(onEngageSector, "Sector engaged.")}
        />
      )}

      {state === "REWARD" && isV2 && run.routeSelectPending && (
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

      {state === "REWARD" && (!isV2 || !run.routeSelectPending) && (
        <SectorRewardInterstitial
          quest={quest}
          disabled={disabled}
          onContinue={() => wrap(onContinueReward, "Pushing deeper...")}
        />
      )}

      {isV2 &&
        (state === "ENCOUNTER" || state === "BOSS") &&
        run.activeType === "VOCAB" && (
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

      {state === "BOSS" && isV2 && (
        <BossPhaseOverlay quest={quest} run={run} />
      )}

      {state === "BOSS" && (
        <Panel tone="boss" className="nozomi-boss-frame relative border-[var(--danger)]/40">
          {isV2 && <BossIntegrityBar run={run} />}
          {isV2 && (
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
          {isV2 && quest.vocabularyEncounter && (
            <DungeonActionBar
              playerLevel={player?.level ?? 1}
              selected={run.selectedDungeonAction}
              disabled={disabled}
              onSelect={onSelectCombatAction}
            />
          )}
          {(run.bossPhase === 0 || (isV2 && quest.vocabularyEncounter)) &&
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
            setStatus("Extraction complete.")
          }}
        />
      )}

      {state === "EXTRACTION" && !run.extractionChoicePending && runSummary && (
        <DungeonRunRecap summary={runSummary} />
      )}
    </>
  )

  return (
    <DungeonRunShell run={run} minimal={inEncounter && state !== "REWARD"}>
      <Panel
        as="article"
        tone={state === "BOSS" ? "boss" : "default"}
        className="!bg-transparent !shadow-none !ring-0"
      >
        <div className="mb-4 flex flex-col gap-3 border-b border-[var(--border-subtle)]/60 pb-4">
          <h3 className="font-display text-xl font-semibold tracking-tight text-[var(--foreground)]">
            {quest.title}
          </h3>
          <DungeonRunHud
            run={run}
            machineState={state}
            sectorsDone={sectorsDone}
            sectorTotal={sectorTotal}
            timeRemainingMs={timeRemainingMs}
            compact={inEncounter}
          />
          {isV2 && <DungeonThreatHud run={run} compact={inEncounter} />}
          <DungeonMasterPresence run={run} minimal={inEncounter && state !== "BOSS"} />
          {isV2 && (
            <DungeonModifierRail
              modifier={run.activeModifier}
              modifiers={run.modifiers}
            />
          )}
        </div>

        {!inEncounter && !isV2 && (
          <div className="mb-6 flex flex-col gap-5">
            <DungeonPhaseStepper machineState={state} />
            <DungeonCorridorRail sectors={corridorSectors} />
          </div>
        )}

        {inEncounter && state !== "REWARD" ? (
          <EncounterFeedbackProvider quest={quest}>
            <EncounterFeedbackBridge />
            <EncounterFocusShell
              title={quest.title}
              enabled
              autoFocus
              encounterClassName={encounterClassName}
            >
              {encounterBody}
            </EncounterFocusShell>
          </EncounterFeedbackProvider>
        ) : (
          encounterBody
        )}

        {status && (
          <p className="mt-3 text-sm text-[var(--muted)]" role="status">
            {status}
          </p>
        )}

        {state !== "EXTRACTION" && state !== "PREPARATION" && (
          <Button
            variant="danger"
            disabled={disabled}
            onClick={() => wrap(onAbandon)}
            className="mt-4 opacity-90"
          >
            {escapeBeaconActive ? "Emergency extract" : "Abort dungeon"}
          </Button>
        )}
      </Panel>
    </DungeonRunShell>
  )
}
