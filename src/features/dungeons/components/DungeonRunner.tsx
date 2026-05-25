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
import { getDungeonBriefing } from "@/systems/dungeons/dungeonOrchestrator"
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
  explorationLine?: string | null
  onExtract: () => Promise<void>
  onSubmitAnswer: (answer: string) => Promise<void>
  onSendMessage: (message: string) => Promise<void>
  onSubmitSpeech: (transcript: string, ms: number) => Promise<void>
  onSubmitListening: (answer: string) => Promise<void>
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
  explorationLine,
  onExtract,
  onSubmitAnswer,
  onSendMessage,
  onSubmitSpeech,
  onSubmitListening,
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
      setStatus(e instanceof Error ? e.message : "Dungeon action failed")
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

      {state === "EXPLORATION" && (
        <CorridorStage
          run={run}
          disabled={disabled}
          statusLine={systemLine}
          onAdvance={(action) => wrap(() => onAdvanceExploration(action))}
          onEngage={() => wrap(onEngageSector, "Sector engaged.")}
        />
      )}

      {state === "REWARD" && (
        <SectorRewardInterstitial
          quest={quest}
          disabled={disabled}
          onContinue={() => wrap(onContinueReward, "Pushing deeper...")}
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

      {state === "BOSS" && (
        <Panel tone="boss" className="nozomi-boss-frame border-[var(--danger)]/40">
          <p className="mb-1 text-[10px] uppercase tracking-[0.28em] text-[var(--danger)]">
            Warden encounter
          </p>
          <p className="mb-4 font-display text-lg text-[var(--foreground)]">
            {boss?.name ?? "Boss"} — phase {run.bossPhase + 1} / {boss?.phases ?? 2}
          </p>
          {run.bossPhase === 0 && quest.vocabularyEncounter && (
            <VocabularyEncounter
              quest={quest}
              player={player}
              disabled={disabled}
              onSubmit={onSubmitAnswer}
              onAbandon={onAbandon}
            />
          )}
          {run.bossPhase >= 1 && quest.speechEncounter && (
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

      {state === "EXTRACTION" && player && (
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
        </div>

        {!inEncounter && (
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
