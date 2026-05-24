"use client"

import { useEffect, useState } from "react"
import { eventBus } from "@/systems/events/eventBus"
import { GAME_EVENTS } from "@/systems/events/eventTypes"
import {
  nextReactiveToast,
  type ReactiveToast,
} from "@/systems/presentation/reactiveFeedbackSystem"

export function ReactiveFeedbackHost() {
  const [toast, setToast] = useState<ReactiveToast | null>(null)

  useEffect(() => {
    const onXp = (p: unknown) =>
      setToast(nextReactiveToast("xp", p as { xpGained?: number }))
    const onPenalty = () => setToast(nextReactiveToast("warning"))
    const onWrong = () => setToast(nextReactiveToast("glitch"))
    const onLevel = (p: unknown) =>
      setToast(nextReactiveToast("level", p as { level?: number }))

    eventBus.on(GAME_EVENTS.XP_GAINED, onXp)
    eventBus.on(GAME_EVENTS.PENALTY_TRIGGERED, onPenalty)
    eventBus.on(GAME_EVENTS.ENCOUNTER_ANSWER_WRONG, onWrong)
    eventBus.on(GAME_EVENTS.LEVEL_UP, onLevel)
  }, [])

  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => setToast(null), 2200)
    return () => window.clearTimeout(t)
  }, [toast])

  if (!toast) return null

  return (
    <div
      className={`pointer-events-none fixed left-1/2 top-20 z-50 -translate-x-1/2 rounded-lg border px-4 py-2 text-sm font-medium shadow-lg ${toast.className}`}
      role="status"
    >
      {toast.message}
    </div>
  )
}
