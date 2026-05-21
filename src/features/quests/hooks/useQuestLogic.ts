"use client"

import { useCallback, useState } from "react"
import {
  hydratePlayerFromDb,
  requestNewQuest,
  advanceQuest,
  finishQuest,
} from "../services/questService"

export function useQuestLogic(userId: string | undefined) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const hydrate = useCallback(async () => {
    if (!userId) return
    setBusy(true)
    setError(null)
    try {
      await hydratePlayerFromDb(userId)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load player")
    } finally {
      setBusy(false)
    }
  }, [userId])

  const newQuest = useCallback(async () => {
    if (!userId) return
    setBusy(true)
    try {
      await requestNewQuest(userId)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to assign quest")
    } finally {
      setBusy(false)
    }
  }, [userId])

  const progress = useCallback(
    async (questId: string, objectiveId = "obj-1") => {
      if (!userId) return
      setBusy(true)
      try {
        await advanceQuest(userId, questId, objectiveId)
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to progress quest")
      } finally {
        setBusy(false)
      }
    },
    [userId]
  )

  const complete = useCallback(
    async (questId: string) => {
      if (!userId) return
      setBusy(true)
      try {
        await finishQuest(userId, questId)
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to complete quest")
      } finally {
        setBusy(false)
      }
    },
    [userId]
  )

  return { busy, error, hydrate, newQuest, progress, complete }
}
