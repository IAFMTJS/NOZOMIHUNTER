"use client"

import type { PlayerContract } from "@/contracts/player-contract"
import type { QuestContract } from "@/contracts/quest-contract"
import type {
  AnswerInputMode,
  ChallengeDisplayPhase,
  ChallengePromptDirection,
} from "@/contracts/encounter-contract"
import { effectiveAssistLevel, resolveQuestGameMode } from "@/systems/gameModes/gameModeSystem"
import { ChallengeDisplayProvider } from "@/features/encounters/context/LearnerAssistContext"

interface EncounterDisplayProviderProps {
  quest: QuestContract
  player?: PlayerContract | null
  promptDirection?: ChallengePromptDirection | null
  inputMode?: AnswerInputMode | null
  phase?: ChallengeDisplayPhase
  children: React.ReactNode
}

export function EncounterDisplayProvider({
  quest,
  player,
  promptDirection = null,
  inputMode = null,
  phase = "ACTIVE",
  children,
}: EncounterDisplayProviderProps) {
  const mode = resolveQuestGameMode(quest)
  const assistLevel = player ? effectiveAssistLevel(player, mode) : "FULL"

  return (
    <ChallengeDisplayProvider
      value={{
        assistLevel,
        promptDirection,
        inputMode,
        phase,
        challengeMode: promptDirection != null,
      }}
    >
      {children}
    </ChallengeDisplayProvider>
  )
}
