"use client"

import { useState, useEffect } from "react"
import type { QuestContract } from "@/contracts/quest-contract"
import {
  dungeonTimeRemaining,
  formatDungeonTimeRemaining,
} from "@/systems/economy/shopEffectSystem"
import { VocabularyEncounter } from "@/features/quests/components/VocabularyEncounter"
import { ConversationEncounter } from "@/features/conversation/components/ConversationEncounter"
import { SpeechEncounter } from "@/features/speech/components/SpeechEncounter"
import { ListeningEncounter } from "./ListeningEncounter"
import { getDungeonBriefing } from "@/systems/dungeons/dungeonOrchestrator"
import { Panel } from "@/components/ui/Panel"
import { Button } from "@/components/ui/Button"
import { StatusChip } from "@/components/ui/StatusChip"
import { DungeonPhaseStepper } from "@/components/ui/DungeonPhaseStepper"
import { DungeonCorridorRail } from "@/components/ui/DungeonCorridorRail"
import { EncounterFocusShell } from "@/components/ui/EncounterFocusShell"
import { ExplorationLayer } from "@/features/dungeons/components/ExplorationLayer"
import { SectorRewardInterstitial } from "@/features/dungeons/components/SectorRewardInterstitial"
import { ExtractionCeremony } from "@/features/dungeons/components/ExtractionCeremony"
import type { ExplorationAction } from "@/contracts/dungeon-contract"

interface DungeonRunnerProps {
  quest: QuestContract
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
  disabled,
  encounterClassName = "",
  maxWrongAttempts,
  maxListeningReplays,
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

  if (!run) return null

  const boss = run.dungeon.boss
  const encounters = run.dungeon.encounters
  const sectorsDone = encounters.filter((e) => e.completed).length
  const sectorTotal = encounters.length
  const objective = quest.objectives[0]
  const activeSectorIndex = encounters.findIndex((e) => !e.completed)
  const state = run.machineState
  const inEncounter =
    state === "ENCOUNTER" || state === "BOSS" || state === "REWARD"

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
    label: `Sector ${i + 1} · ${e.type}`,
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
        <div className="nozomi-embedded flex flex-col gap-3 rounded-[var(--radius-panel)] p-4">
          <p className="text-sm text-[var(--muted)]">
            Corridor synchronized. Deploy into the sector grid when operational
            readiness is acceptable — failures stack corruption fast.
          </p>
          <Button
            disabled={disabled}
            onClick={() => wrap(onDeploy, "Deployed into sector grid.")}
          >
            Deploy to sector
          </Button>
        </div>
      )}

      {state === "EXPLORATION" && (
        <ExplorationLayer
          run={run}
          disabled={disabled}
          statusLine={explorationLine}
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
          disabled={disabled}
          onSubmit={onSubmitAnswer}
          onAbandon={onAbandon}
        />
      )}

      {state === "ENCOUNTER" && run.activeType === "LISTENING" && (
        <ListeningEncounter
          quest={quest}
          disabled={disabled}
          maxWrongAttempts={maxWrongAttempts}
          maxReplays={maxListeningReplays}
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
          disabled={disabled}
          onSubmit={onSubmitSpeech}
          onAbandon={onAbandon}
        />
      )}

      {state === "BOSS" && (
        <Panel tone="boss" className="mb-3">
          <p className="mb-3 text-sm font-semibold text-[var(--danger)]">
            {boss?.name ?? "Boss"} — phase {run.bossPhase + 1} / {boss?.phases ?? 2}
          </p>
          {run.bossPhase === 0 && quest.vocabularyEncounter && (
            <VocabularyEncounter
              quest={quest}
              disabled={disabled}
              onSubmit={onSubmitAnswer}
              onAbandon={onAbandon}
            />
          )}
          {run.bossPhase >= 1 && quest.speechEncounter && (
            <SpeechEncounter
              quest={quest}
              disabled={disabled}
              onSubmit={onSubmitSpeech}
              onAbandon={onAbandon}
            />
          )}
        </Panel>
      )}

      {state === "EXTRACTION" && (
        <ExtractionCeremony
          xp={quest.rewards.xp}
          theme={run.dungeon.theme}
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
    <Panel as="article" tone={state === "BOSS" ? "boss" : "default"}>
      <div className="mb-4 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-lg font-semibold text-[var(--foreground)]">
            {quest.title}
          </h3>
          <StatusChip
            label={state.replace(/_/g, " ")}
            tone={state === "BOSS" ? "danger" : "neutral"}
          />
        </div>
        <p className="font-display text-sm leading-relaxed text-[var(--muted)]">
          {getDungeonBriefing(quest)}
        </p>
      </div>

      <div className="mb-8 flex flex-col gap-6">
        <DungeonPhaseStepper machineState={state} />
        <DungeonCorridorRail sectors={corridorSectors} />
      </div>

      <p className="mb-6 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
        Sectors {sectorsDone}/{sectorTotal}
        {objective
          ? ` · Progress ${objective.currentProgress}/${objective.requiredProgress}`
          : ""}
        {boss ? ` · Boss: ${boss.name}` : ""}
        {timeRemainingMs != null && run.runStartedAt
          ? ` · Time ${formatDungeonTimeRemaining(timeRemainingMs)}`
          : ""}
      </p>

      {inEncounter ? (
        <EncounterFocusShell
          title={quest.title}
          enabled
          autoFocus
          encounterClassName={encounterClassName}
        >
          {encounterBody}
        </EncounterFocusShell>
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
          className="mt-4"
        >
          {escapeBeaconActive ? "Emergency extract" : "Abort dungeon"}
        </Button>
      )}
    </Panel>
  )
}
