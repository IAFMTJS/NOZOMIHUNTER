"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import type { QuestContract } from "@/contracts/quest-contract"
import type { PlayerContract } from "@/contracts/player-contract"
import { dungeonTimeRemaining } from "@/systems/economy/shopEffectSystem"
import { hasReplayBan } from "@/systems/dungeons/dungeonModifierSystem"
import { listRouteChoices } from "@/systems/dungeons/dungeonOrchestrator"
import { isDungeonV2Run } from "@/systems/dungeons/dungeonV2Helpers"
import { buildDungeonRunSummary } from "@/systems/dungeons/dungeonRunSummarySystem"
import { DungeonThreatHud } from "@/features/dungeons/components/DungeonThreatHud"
import { DungeonModifierRail } from "@/features/dungeons/components/DungeonModifierRail"
import { DungeonMasterPresence } from "@/features/dungeons/components/DungeonMasterPresence"
import { Panel } from "@/components/ui/Panel"
import { Button } from "@/components/ui/Button"
import { DungeonPhaseStepper } from "@/components/ui/DungeonPhaseStepper"
import { DungeonCorridorRail } from "@/components/ui/DungeonCorridorRail"
import { EncounterFocusShell } from "@/components/ui/EncounterFocusShell"
import { DungeonRunShell } from "@/features/dungeons/components/DungeonRunShell"
import { DungeonRunHud } from "@/features/dungeons/components/DungeonRunHud"
import { DungeonRunnerFailureOverlay } from "@/features/dungeons/components/DungeonRunnerFailureOverlay"
import { DungeonRunnerEncounterBody } from "@/features/dungeons/components/DungeonRunnerEncounterBody"
import { dungeonFailureConsequenceLine } from "@/systems/dungeons/dungeonPresentationSystem"
import { shouldShowDungeonFailureCeremony } from "@/systems/dungeons/dungeonFailureCeremonyFlow"
import { DUNGEON_CONFIG } from "@/config/dungeonConfig"
import {
  encounterTypeGlyph,
  sectorNodeLabel,
} from "@/systems/dungeons/dungeonPresentationSystem"
import { getMasteryMap } from "@/systems/mastery/masterySystem"
import { getVocabularyCatalog } from "@/systems/mastery/vocabularyCatalog"
import { buildExtractionMasteryRecap } from "@/systems/dungeons/dungeonLexiconRecapSystem"
import { EncounterFeedbackProvider } from "@/features/encounters/context/EncounterFeedbackContext"
import { EncounterFeedbackBridge } from "@/features/encounters/EncounterFeedbackBridge"
import { E2E_TEST_IDS } from "@/config/e2eTestIds"
import { stopRunAudio } from "@/systems/audio/audioSystem"
import { eventBus } from "@/systems/events/eventBus"
import { GAME_EVENTS } from "@/systems/events/eventTypes"
import { SectorClearedBeat } from "@/components/ceremonies/SectorClearedBeat"
import { DUNGEON_CONSEQUENCE_COPY } from "@/contracts/presentation-contract"

interface DungeonRunnerProps {
  quest: QuestContract
  player?: PlayerContract | null
  disabled?: boolean
  encounterClassName?: string
  maxWrongAttempts?: number
  maxListeningReplays?: number
  signalDegraded?: boolean
  onDeploy: () => Promise<void>
  onAdvanceExploration: (
    action: import("@/contracts/dungeon-contract").ExplorationAction
  ) => Promise<void>
  onEngageSector: () => Promise<void>
  onContinueReward: () => Promise<void>
  onChooseRoute: (exitId: string) => Promise<void>
  onSelectCombatAction: (
    action: import("@/contracts/dungeon-contract").DungeonAction
  ) => Promise<void>
  onExtractionChoice: (
    choice: import("@/contracts/dungeon-contract").DungeonExtractionChoice
  ) => Promise<void>
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

export function DungeonRunner(props: DungeonRunnerProps) {
  const {
    quest,
    player,
    disabled,
    encounterClassName = "",
    maxWrongAttempts,
    maxListeningReplays = 3,
    signalDegraded,
    explorationLine,
    escapeBeaconActive,
  } = props

  const [status, setStatus] = useState<string | null>(null)
  const [failureDismissed, setFailureDismissed] = useState(false)
  const [timeRemainingMs, setTimeRemainingMs] = useState<number | null>(null)
  const [sectorBeatOpen, setSectorBeatOpen] = useState(false)
  const run = quest.dungeonRun

  useEffect(() => {
    const onSectorCleared = (payload: unknown) => {
      const p = payload as { dungeonId?: string }
      if (run?.dungeon.id && p.dungeonId === run.dungeon.id) {
        setSectorBeatOpen(true)
      }
    }
    eventBus.on(GAME_EVENTS.SECTOR_CLEARED, onSectorCleared)
    return () => eventBus.off(GAME_EVENTS.SECTOR_CLEARED, onSectorCleared)
  }, [run?.dungeon.id])

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

  useEffect(() => () => stopRunAudio(), [])

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

  const wrap = useCallback(
    async <T,>(fn: () => Promise<T>, okMsg?: string): Promise<T | undefined> => {
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
    },
    []
  )

  if (!run) return null

  const encounters = run.dungeon.encounters
  const sectorsDone = encounters.filter((e) => e.completed).length
  const sectorTotal = encounters.length
  const activeSectorIndex = encounters.findIndex((e) => !e.completed)
  const state = run.machineState
  const inEncounter =
    state === "ENCOUNTER" || state === "BOSS" || state === "REWARD"
  const systemLine = explorationLine ?? run.explorationSystemLine ?? null
  const replayCap = hasReplayBan(run.modifiers) ? 1 : maxListeningReplays
  const missingEncounterPayload =
    state === "ENCOUNTER" &&
    ((run.activeType === "VOCAB" && !(quest.vocabularyEncounter?.words.length ?? 0)) ||
      (run.activeType === "LISTENING" &&
        !(quest.listeningEncounter?.fragments.length ?? 0)) ||
      (run.activeType === "NPC" &&
        !(quest.conversationEncounter?.messages.length ?? 0)) ||
      (run.activeType === "SPEECH" && !(quest.speechEncounter?.phrases.length ?? 0)))

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

  const failureLine =
    state === "FAILURE"
      ? dungeonFailureConsequenceLine(run, DUNGEON_CONFIG.MAX_ENCOUNTER_FAILURES)
      : null

  const failureCeremonyOpen = shouldShowDungeonFailureCeremony(
    state,
    failureDismissed
  )

  const encounterBody = (
    <DungeonRunnerEncounterBody
      quest={quest}
      run={run}
      player={player}
      disabled={disabled}
      isV2={isV2}
      state={state}
      routeChoices={routeChoices}
      systemLine={systemLine}
      replayCap={replayCap}
      maxWrongAttempts={maxWrongAttempts}
      signalDegraded={signalDegraded}
      missingEncounterPayload={missingEncounterPayload}
      extractionRecap={extractionRecap}
      runSummary={runSummary}
      wrap={wrap}
      onExplorationError={setStatus}
      onExtractionStatus={setStatus}
      onDeploy={props.onDeploy}
      onAdvanceExploration={props.onAdvanceExploration}
      onEngageSector={props.onEngageSector}
      onContinueReward={props.onContinueReward}
      onChooseRoute={props.onChooseRoute}
      onSelectCombatAction={props.onSelectCombatAction}
      onExtractionChoice={props.onExtractionChoice}
      onExtract={props.onExtract}
      onSubmitAnswer={props.onSubmitAnswer}
      onSendMessage={props.onSendMessage}
      onSubmitSpeech={props.onSubmitSpeech}
      onSubmitListening={props.onSubmitListening}
      onListeningReplay={props.onListeningReplay}
      onAbandon={props.onAbandon}
      timeRemainingMs={timeRemainingMs}
    />
  )

  return (
    <>
      <SectorClearedBeat
        open={sectorBeatOpen}
        line={DUNGEON_CONSEQUENCE_COPY.sectorCleared}
        onDone={() => setSectorBeatOpen(false)}
      />
      <DungeonRunnerFailureOverlay
        open={failureCeremonyOpen}
        detailLine={failureLine}
        onContinue={() => setFailureDismissed(true)}
      />
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

          {state !== "EXTRACTION" && (
            <Button
              variant="danger"
              disabled={disabled}
              data-testid={E2E_TEST_IDS.dungeonAbort}
              onClick={() => wrap(props.onAbandon)}
              className="mt-4 opacity-90"
            >
              {escapeBeaconActive ? "Emergency extract" : "Abort dungeon"}
            </Button>
          )}
        </Panel>
      </DungeonRunShell>
    </>
  )
}
