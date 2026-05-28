"use client"

import type { ReactNode } from "react"
import type { QuestContract } from "@/contracts/quest-contract"
import type { PlayerContract } from "@/contracts/player-contract"
import { effectiveAssistLevel, resolveQuestGameMode } from "@/systems/gameModes/gameModeSystem"
import { isRecallChallengeQuest } from "@/systems/learning/encounterDisplayPolicy"
import { ChallengeDisplayProvider } from "@/features/encounters/context/LearnerAssistContext"

export function EncounterRouterDisplayShell({
  quest,
  player,
  children,
}: {
  quest: QuestContract
  player?: PlayerContract | null
  children: ReactNode
}) {
  const mode = resolveQuestGameMode(quest)
  const assistLevel = player ? effectiveAssistLevel(player, mode) : "FULL"

  return (
    <ChallengeDisplayProvider
      value={{
        assistLevel,
        promptDirection: null,
        phase: "ACTIVE",
        inputMode: null,
        challengeMode: isRecallChallengeQuest(quest),
      }}
    >
      {children}
    </ChallengeDisplayProvider>
  )
}
