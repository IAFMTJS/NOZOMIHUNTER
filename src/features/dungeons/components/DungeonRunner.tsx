"use client"

import { useState } from "react"
import type { QuestContract } from "@/contracts/quest-contract"
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
import { ExtractionCeremony } from "./ExtractionCeremony"

interface DungeonRunnerProps {
  quest: QuestContract
  disabled?: boolean
  encounterClassName?: string
  maxWrongAttempts?: number
  maxListeningReplays?: number
  signalDegraded?: boolean
  onDeploy: () => Promise<void>
  onEnterSector: () => Promise<void>
  onExtract: () => Promise<void>
  onSubmitAnswer: (answer: string) => Promise<void>
  onSendMessage: (message: string) => Promise<void>
  onSubmitSpeech: (transcript: string, ms: number) => Promise<void>
  onSubmitListening: (answer: string) => Promise<void>
  onAbandon: () => Promise<void>
}

export function DungeonRunner({
  quest,
  disabled,
  encounterClassName = "",
  maxWrongAttempts,
  maxListeningReplays,
  signalDegraded,
  onDeploy,
  onEnterSector,
  onExtract,
  onSubmitAnswer,
  onSendMessage,
  onSubmitSpeech,
  onSubmitListening,
  onAbandon,
}: DungeonRunnerProps) {
  const [status, setStatus] = useState<string | null>(null)
  const run = quest.dungeonRun
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
  }))

  const encounterBody = (
    <>
      {state === "PREPARATION" && (
        <div className="flex flex-col gap-3">
          <p className="text-sm">
            The corridor is live. Deploy when ready — reckless failures stack
            corruption fast.
          </p>
          <Button
            disabled={disabled}
            onClick={() => wrap(onDeploy, "Deployed into sector grid.")}
          >
            Deploy
          </Button>
        </div>
      )}

      {state === "EXPLORATION" && (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-[var(--muted)]">
            Next sector awaits. Enter when your focus is sharp.
          </p>
          <Button
            disabled={disabled}
            onClick={() => wrap(onEnterSector, "Sector engaged.")}
          >
            Enter sector
          </Button>
        </div>
      )}

      {state === "REWARD" && (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-[var(--accent-bright)]">Sector cleared.</p>
          <Button
            variant="ghost"
            disabled={disabled}
            onClick={() => wrap(onEnterSector, "Pushing deeper...")}
          >
            Continue
          </Button>
        </div>
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
    <Panel as="article" tone="accent">
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="font-display text-lg font-semibold text-[var(--foreground)]">
          {quest.title}
        </h3>
        <StatusChip
          label={state.replace(/_/g, " ")}
          tone={state === "BOSS" ? "danger" : "accent"}
        />
      </div>

      <p className="mb-2 font-display text-sm text-[var(--accent-bright)]">
        {getDungeonBriefing(quest)}
      </p>

      <DungeonPhaseStepper machineState={state} />

      <DungeonCorridorRail sectors={corridorSectors} />

      <p className="mb-4 text-xs text-[var(--muted)]">
        Sectors {sectorsDone}/{sectorTotal}
        {objective
          ? ` · Progress ${objective.currentProgress}/${objective.requiredProgress}`
          : ""}
        {boss ? ` · Boss: ${boss.name}` : ""}
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
          Abort dungeon
        </Button>
      )}
    </Panel>
  )
}
