"use client"

import { useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { usePlayerStore } from "@/stores/usePlayerStore"
import { useQuestLogic } from "@/features/quests/hooks/useQuestLogic"
import { syncCorruptionAudio } from "@/systems/audio/registerAudioHandlers"
import { registerCoreEventHandlers } from "@/systems/events/eventHandlers"

let eventsRegistered = false

export type HunterHydrationPhase =
  | "auth-loading"
  | "unconfigured"
  | "guest"
  | "hydrating"
  | "ready"

export function useHunterHydration() {
  const { user, signOut, loading, configured } = useAuth()
  const player = usePlayerStore((s) => s.player)
  const playerHydrated = usePlayerStore((s) => s.isHydrated)
  const quest = useQuestLogic(user?.id)

  useEffect(() => {
    if (!eventsRegistered) {
      registerCoreEventHandlers()
      eventsRegistered = true
    }
  }, [])

  useEffect(() => {
    if (user?.id) void quest.hydrate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  useEffect(() => {
    if (player) syncCorruptionAudio(player.penalties.corruption)
  }, [player])

  let phase: HunterHydrationPhase = "ready"
  if (loading) phase = "auth-loading"
  else if (!configured) phase = "unconfigured"
  else if (!user) phase = "guest"
  else if (!playerHydrated) phase = "hydrating"

  return {
    user,
    signOut,
    configured,
    loading,
    player,
    playerHydrated,
    phase,
    quest,
  }
}
