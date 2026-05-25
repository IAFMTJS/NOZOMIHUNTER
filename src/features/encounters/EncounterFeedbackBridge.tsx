"use client"

import { useEffect } from "react"
import { eventBus } from "@/systems/events/eventBus"
import { GAME_EVENTS } from "@/systems/events/eventTypes"
import { useEncounterFeedback } from "@/features/encounters/context/EncounterFeedbackContext"

/** Subscribes to encounter answer events and drives EncounterImpactLayer. */
export function EncounterFeedbackBridge() {
  const { flashFeedback } = useEncounterFeedback()

  useEffect(() => {
    const onCorrect = (payload: unknown) => {
      const p = payload as { correctStreak?: number }
      flashFeedback({
        outcome: "correct",
        correctStreak: p.correctStreak,
      })
    }
    const onWrong = (payload: unknown) => {
      const p = payload as { previousStreak?: number }
      flashFeedback({
        outcome: p.previousStreak && p.previousStreak >= 3 ? "combo_break" : "wrong",
        previousStreak: p.previousStreak,
      })
    }
    eventBus.on(GAME_EVENTS.ENCOUNTER_ANSWER_CORRECT, onCorrect)
    eventBus.on(GAME_EVENTS.ENCOUNTER_ANSWER_WRONG, onWrong)
    return () => {
      eventBus.off(GAME_EVENTS.ENCOUNTER_ANSWER_CORRECT, onCorrect)
      eventBus.off(GAME_EVENTS.ENCOUNTER_ANSWER_WRONG, onWrong)
    }
  }, [flashFeedback])

  return null
}
