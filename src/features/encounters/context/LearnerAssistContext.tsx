"use client"

import { createContext, useContext } from "react"
import type { AssistLevel } from "@/contracts/game-mode-contract"
import type {
  AnswerInputMode,
  ChallengeDisplayPhase,
  ChallengePromptDirection,
} from "@/contracts/encounter-contract"

export interface ChallengeDisplayState {
  assistLevel: AssistLevel
  promptDirection: ChallengePromptDirection | null
  phase: ChallengeDisplayPhase
  inputMode: AnswerInputMode | null
  /** When false, catalog/browse shows full triple. */
  challengeMode: boolean
}

const DEFAULT_STATE: ChallengeDisplayState = {
  assistLevel: "FULL",
  promptDirection: null,
  phase: "ACTIVE",
  inputMode: null,
  challengeMode: false,
}

const ChallengeDisplayContext = createContext<ChallengeDisplayState>(DEFAULT_STATE)

export function ChallengeDisplayProvider({
  value,
  children,
}: {
  value: Partial<ChallengeDisplayState>
  children: React.ReactNode
}) {
  const merged: ChallengeDisplayState = { ...DEFAULT_STATE, ...value }
  return (
    <ChallengeDisplayContext.Provider value={merged}>
      {children}
    </ChallengeDisplayContext.Provider>
  )
}

/** @deprecated Use ChallengeDisplayProvider */
export function LearnerAssistProvider({
  level,
  children,
}: {
  level: AssistLevel
  children: React.ReactNode
}) {
  return (
    <ChallengeDisplayProvider value={{ assistLevel: level, challengeMode: false }}>
      {children}
    </ChallengeDisplayProvider>
  )
}

export function useChallengeDisplay(): ChallengeDisplayState {
  return useContext(ChallengeDisplayContext)
}

/** @deprecated Use useChallengeDisplay().assistLevel */
export function useLearnerAssist(): AssistLevel {
  return useContext(ChallengeDisplayContext).assistLevel
}
