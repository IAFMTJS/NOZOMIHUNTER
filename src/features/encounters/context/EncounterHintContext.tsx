"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react"
import type {
  CompanionWhisperContract,
  HintWordContextContract,
} from "@/contracts/hint-contract"
import type { AssistLevel } from "@/contracts/game-mode-contract"
import type { VisibleLayers } from "@/systems/learning/challengeDisplaySystem"
import { HINT_CONFIG } from "@/config/hintConfig"
import {
  buildCompanionWhisper,
  canRequestWhisper,
  canSpendVisionCharge,
  resolveHintSessionLimits,
  resolveHunterVisionReveal,
  shouldAutoWhisper,
  visionLayersFromReveal,
} from "@/systems/hints/hintSystem"
import { eventBus } from "@/systems/events/eventBus"
import { GAME_EVENTS } from "@/systems/events/eventTypes"

interface EncounterHintContextValue {
  whisper: CompanionWhisperContract | null
  visionActive: boolean
  visionLayers: VisibleLayers | null
  radicalNote: string | null
  limits: ReturnType<typeof resolveHintSessionLimits>
  requestWhisper: () => void
  onVisionPointerDown: () => void
  onVisionPointerUp: () => void
  onVisionPointerCancel: () => void
}

const EncounterHintCtx = createContext<EncounterHintContextValue | null>(null)

interface EncounterHintProviderProps {
  questId: string
  wordContext: HintWordContextContract | null
  assistLevel: AssistLevel
  wrongAttempts: number
  phase?: "ACTIVE" | "REVEALED"
  children: ReactNode
}

export function EncounterHintProvider({
  questId,
  wordContext,
  assistLevel,
  wrongAttempts,
  phase = "ACTIVE",
  children,
}: EncounterHintProviderProps) {
  const [whispersUsed, setWhispersUsed] = useState(0)
  const [visionChargesUsed, setVisionChargesUsed] = useState(0)
  const [visionActive, setVisionActive] = useState(false)
  const [whisper, setWhisper] = useState<CompanionWhisperContract | null>(null)
  const [lastAutoWhisperAtWrong, setLastAutoWhisperAtWrong] = useState(0)
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const holdSpentRef = useRef(false)

  const limits = useMemo(
    () =>
      resolveHintSessionLimits({
        assistLevel,
        whispersUsed,
        visionChargesUsed,
      }),
    [assistLevel, whispersUsed, visionChargesUsed]
  )

  useEffect(() => {
    setWhispersUsed(0)
    setVisionChargesUsed(0)
    setVisionActive(false)
    setWhisper(null)
    setLastAutoWhisperAtWrong(0)
    holdSpentRef.current = false
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current)
      holdTimerRef.current = null
    }
  }, [wordContext?.wordId])

  useEffect(() => {
    if (!wordContext || phase !== "ACTIVE") return
    if (!shouldAutoWhisper(wrongAttempts, lastAutoWhisperAtWrong)) return
    const currentLimits = resolveHintSessionLimits({
      assistLevel,
      whispersUsed,
      visionChargesUsed,
    })
    if (!canRequestWhisper(currentLimits)) return

    setWhisper(buildCompanionWhisper(wordContext, { forceFailure: true }))
    setWhispersUsed((n) => n + 1)
    setLastAutoWhisperAtWrong(wrongAttempts)
    eventBus.emit(GAME_EVENTS.HINT_WHISPER_SHOWN, {
      questId,
      wordId: wordContext.wordId,
      kind: "FAILURE_REINFORCE",
      auto: true,
    })
  }, [
    wrongAttempts,
    wordContext,
    phase,
    lastAutoWhisperAtWrong,
    assistLevel,
    whispersUsed,
    visionChargesUsed,
    questId,
  ])

  const clearHoldTimer = useCallback(() => {
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current)
      holdTimerRef.current = null
    }
  }, [])

  const onVisionPointerUp = useCallback(() => {
    clearHoldTimer()
    holdSpentRef.current = false
    setVisionActive(false)
  }, [clearHoldTimer])

  const onVisionPointerCancel = onVisionPointerUp

  const onVisionPointerDown = useCallback(() => {
    if (!wordContext || phase !== "ACTIVE") return
    clearHoldTimer()
    holdSpentRef.current = false
    holdTimerRef.current = setTimeout(() => {
      if (!canSpendVisionCharge(limits)) return
      holdSpentRef.current = true
      setVisionChargesUsed((n) => n + 1)
      setVisionActive(true)
      eventBus.emit(GAME_EVENTS.HINT_VISION_ACTIVATED, {
        questId,
        wordId: wordContext.wordId,
      })
    }, HINT_CONFIG.VISION_HOLD_MS)
  }, [wordContext, phase, limits, questId, clearHoldTimer])

  const requestWhisper = useCallback(() => {
    if (!wordContext || !canRequestWhisper(limits)) return
    const line = buildCompanionWhisper(wordContext)
    setWhisper(line)
    setWhispersUsed((n) => n + 1)
    eventBus.emit(GAME_EVENTS.HINT_WHISPER_SHOWN, {
      questId,
      wordId: wordContext.wordId,
      kind: line.kind,
      auto: false,
    })
  }, [wordContext, limits, questId])

  const reveal =
    wordContext && visionActive && phase === "ACTIVE"
      ? resolveHunterVisionReveal(wordContext, assistLevel)
      : null

  const value = useMemo(
    (): EncounterHintContextValue => ({
      whisper,
      visionActive: Boolean(reveal),
      visionLayers: reveal ? visionLayersFromReveal(reveal) : null,
      radicalNote: reveal?.radicalNote ?? null,
      limits,
      requestWhisper,
      onVisionPointerDown,
      onVisionPointerUp,
      onVisionPointerCancel,
    }),
    [
      whisper,
      reveal,
      limits,
      requestWhisper,
      onVisionPointerDown,
      onVisionPointerUp,
      onVisionPointerCancel,
    ]
  )

  return (
    <EncounterHintCtx.Provider value={value}>{children}</EncounterHintCtx.Provider>
  )
}

export function useEncounterHint(): EncounterHintContextValue {
  const ctx = useContext(EncounterHintCtx)
  if (!ctx) {
    throw new Error("useEncounterHint requires EncounterHintProvider")
  }
  return ctx
}

export function useEncounterHintOptional(): EncounterHintContextValue | null {
  return useContext(EncounterHintCtx)
}
