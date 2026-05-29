"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import type { QuestContract } from "@/contracts/quest-contract"
import {
  orchestrateEncounterFeedback,
  resolveEncounterChannel,
  type EncounterFeedbackResult,
  type EncounterFeedbackInput,
} from "@/systems/presentation/encounterFeedbackOrchestrator"
import { EncounterImpactLayer } from "@/components/feedback/EncounterImpactLayer"
import { playAudioCues, stopEncounterFeedbackAudio } from "@/systems/audio/audioSystem"
import { triggerMomentFreeze } from "@/systems/presentation/momentFreezeSystem"

interface EncounterFeedbackContextValue {
  channel: ReturnType<typeof resolveEncounterChannel>
  flashFeedback: (input: Omit<EncounterFeedbackInput, "channel" | "narrativeTier" | "isDungeon" | "isTraining">) => void
  lastFeedback: EncounterFeedbackResult | null
}

const EncounterFeedbackCtx = createContext<EncounterFeedbackContextValue | null>(null)

export function EncounterFeedbackProvider({
  quest,
  isTraining,
  children,
}: {
  quest: QuestContract
  isTraining?: boolean
  children: ReactNode
}) {
  const [lastFeedback, setLastFeedback] = useState<EncounterFeedbackResult | null>(null)

  const channel = useMemo(
    () =>
      resolveEncounterChannel({
        narrativeTier: quest.narrativeTier,
        isDungeon: quest.type === "DUNGEON",
        isTraining: isTraining ?? quest.hidden === true,
      }),
    [quest.narrativeTier, quest.type, quest.hidden, isTraining]
  )

  useEffect(() => () => stopEncounterFeedbackAudio(), [])

  const flashFeedback = useCallback(
    (input: Omit<EncounterFeedbackInput, "channel" | "narrativeTier" | "isDungeon" | "isTraining">) => {
      const result = orchestrateEncounterFeedback({
        ...input,
        channel,
        narrativeTier: quest.narrativeTier,
        isDungeon: quest.type === "DUNGEON",
        isTraining: isTraining ?? quest.hidden === true,
      })
      if (result.audioCues.length > 0) {
        playAudioCues(result.audioCues)
      }
      if (result.freezeMs && result.freezeMs > 0) {
        triggerMomentFreeze(result.freezeMs)
      }
      setLastFeedback(result)
    },
    [channel, quest.narrativeTier, quest.type, quest.hidden, isTraining]
  )

  const value = useMemo(
    () => ({ channel, flashFeedback, lastFeedback }),
    [channel, flashFeedback, lastFeedback]
  )

  return (
    <EncounterFeedbackCtx.Provider value={value}>
      <div className="relative">
        <EncounterImpactLayer feedback={lastFeedback} />
        {children}
      </div>
    </EncounterFeedbackCtx.Provider>
  )
}

export function useEncounterFeedback(): EncounterFeedbackContextValue {
  const ctx = useContext(EncounterFeedbackCtx)
  if (!ctx) {
    throw new Error("useEncounterFeedback requires EncounterFeedbackProvider")
  }
  return ctx
}
