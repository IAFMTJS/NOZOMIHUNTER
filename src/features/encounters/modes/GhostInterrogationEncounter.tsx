"use client"

import { useState } from "react"
import type { QuestContract } from "@/contracts/quest-contract"
import { ConversationEncounter } from "@/features/conversation/components/ConversationEncounter"
import { Panel } from "@/components/ui/Panel"
import { Button } from "@/components/ui/Button"
import { ModeEncounterShell } from "@/features/encounters/modes/ModeEncounterShell"
import { GHOST_INTERROGATION_CHOICES } from "@/config/ghostInterrogationConfig"

interface GhostInterrogationEncounterProps {
  quest: QuestContract
  disabled?: boolean
  onSend: (message: string) => Promise<{
    passed: boolean
    encounterFailed: boolean
    feedback: string
  } | null>
  onAbandon: () => Promise<void>
  flashClassName?: string
}

export function GhostInterrogationEncounter(props: GhostInterrogationEncounterProps) {
  const panic = props.quest.conversationEncounter?.panicMode
  const seconds = props.quest.conversationEncounter?.panicSecondsRemaining
  const [branchHint, setBranchHint] = useState<string | null>(null)

  async function pickChoice(implication: string) {
    setBranchHint(implication)
    return props.onSend(implication)
  }

  const emotion = panic ? "Social pressure" : "Curiosity"
  const label = panic ? "Panic Channel" : "Ghost Interrogation"

  return (
    <ModeEncounterShell modeLabel={label} emotion={emotion}>
      {panic && seconds != null && (
        <Panel tone="corruption" className="mb-3 !p-3">
          <p className="text-xs uppercase tracking-widest text-[var(--danger)]">
            Crisis timer — {seconds}s to respond
          </p>
        </Panel>
      )}
      <Panel tone="inset" className="mb-3 !p-3">
        <p className="text-xs text-[var(--muted)]">
          {panic
            ? "Emergency channel open. Choose the response that de-escalates."
            : "Interpret implication — select a deduction branch or transmit custom reply."}
        </p>
        <div className="mt-2 flex flex-col gap-2">
          {GHOST_INTERROGATION_CHOICES.map((choice) => (
            <Button
              key={choice.id}
              type="button"
              variant="ghost"
              disabled={props.disabled}
              className="justify-start text-left text-xs"
              onClick={() => void pickChoice(choice.implication)}
            >
              {choice.label}
            </Button>
          ))}
        </div>
        {branchHint && (
          <p className="mt-2 text-xs text-[var(--muted)]">Branch: {branchHint}</p>
        )}
      </Panel>
      <ConversationEncounter {...props} />
    </ModeEncounterShell>
  )
}
