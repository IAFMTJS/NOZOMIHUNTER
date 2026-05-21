"use client"

import { useState } from "react"
import type { QuestContract } from "@/contracts/quest-contract"
import { VocabularyEncounter } from "@/features/quests/components/VocabularyEncounter"
import { ConversationEncounter } from "@/features/conversation/components/ConversationEncounter"
import { SpeechEncounter } from "@/features/speech/components/SpeechEncounter"
import { ListeningEncounter } from "./ListeningEncounter"
import { getDungeonBriefing } from "@/systems/dungeons/dungeonOrchestrator"

interface DungeonRunnerProps {
  quest: QuestContract
  disabled?: boolean
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
  const sectorsDone = run.dungeon.encounters.filter((e) => e.completed).length
  const sectorTotal = run.dungeon.encounters.length
  const objective = quest.objectives[0]

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

  const state = run.machineState

  return (
    <article className="rounded border border-[var(--accent)]/40 bg-[var(--accent)]/5 p-4">
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="font-semibold text-[var(--accent)]">{quest.title}</h3>
        <span className="text-xs uppercase text-[var(--muted)]">
          {state.replace("_", " ")}
        </span>
      </div>
      <p className="mb-2 text-sm text-[var(--muted)]">{getDungeonBriefing(quest)}</p>
      <p className="mb-4 text-xs text-[var(--muted)]">
        Sectors {sectorsDone}/{sectorTotal}
        {objective
          ? ` · Progress ${objective.currentProgress}/${objective.requiredProgress}`
          : ""}
        {boss ? ` · Boss: ${boss.name}` : ""}
      </p>

      {state === "PREPARATION" && (
        <div className="flex flex-col gap-3">
          <p className="text-sm">
            The corridor is live. Deploy when ready — reckless failures stack
            corruption fast.
          </p>
          <button
            type="button"
            disabled={disabled}
            onClick={() => wrap(onDeploy, "Deployed into sector grid.")}
            className="rounded border border-[var(--accent)] px-3 py-2 text-sm text-[var(--accent)] hover:bg-[var(--accent)] hover:text-black disabled:opacity-50"
          >
            Deploy
          </button>
        </div>
      )}

      {state === "EXPLORATION" && (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-[var(--muted)]">
            Next sector awaits. Enter when your focus is sharp.
          </p>
          <button
            type="button"
            disabled={disabled}
            onClick={() => wrap(onEnterSector, "Sector engaged.")}
            className="rounded border border-[var(--accent)] px-3 py-2 text-sm text-[var(--accent)] hover:bg-[var(--accent)] hover:text-black disabled:opacity-50"
          >
            Enter sector
          </button>
        </div>
      )}

      {state === "REWARD" && (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-[var(--accent)]">Sector cleared.</p>
          <button
            type="button"
            disabled={disabled}
            onClick={() => wrap(onEnterSector, "Pushing deeper...")}
            className="rounded border border-white/20 px-3 py-2 text-sm hover:bg-white/10 disabled:opacity-50"
          >
            Continue
          </button>
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
        <>
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
        </>
      )}

      {state === "EXTRACTION" && (
        <div className="flex flex-col gap-3">
          <p className="text-sm">
            Core breached. Extract {quest.rewards.xp} XP and registry unlocks.
          </p>
          <button
            type="button"
            disabled={disabled}
            onClick={() => wrap(onExtract, "Extraction complete.")}
            className="rounded border border-[var(--accent)] px-3 py-2 text-sm text-[var(--accent)] hover:bg-[var(--accent)] hover:text-black disabled:opacity-50"
          >
            Extract rewards
          </button>
        </div>
      )}

      {status && (
        <p className="mt-3 text-sm text-[var(--muted)]" role="status">
          {status}
        </p>
      )}

      {state !== "EXTRACTION" && state !== "PREPARATION" && (
        <button
          type="button"
          disabled={disabled}
          onClick={() => wrap(onAbandon)}
          className="mt-4 text-xs text-[var(--danger)] hover:underline disabled:opacity-50"
        >
          Abort dungeon
        </button>
      )}
    </article>
  )
}
