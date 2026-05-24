"use client"

import { createContext, useContext } from "react"
import type { AssistLevel } from "@/contracts/game-mode-contract"

const LearnerAssistContext = createContext<AssistLevel>("FULL")

export function LearnerAssistProvider({
  level,
  children,
}: {
  level: AssistLevel
  children: React.ReactNode
}) {
  return (
    <LearnerAssistContext.Provider value={level}>
      {children}
    </LearnerAssistContext.Provider>
  )
}

export function useLearnerAssist(): AssistLevel {
  return useContext(LearnerAssistContext)
}
