"use client"

import { useCallback, useRef, useState } from "react"
import type { QuestRequestChannel } from "@/contracts/quest-contract"
import {
  hydratePlayerFromDb,
  requestNewQuest,
  advanceQuest,
  finishQuest,
  submitVocabularyAnswerForQuest,
  submitConversationMessageForQuest,
  submitSpeechForQuest,
  submitListeningAnswerForQuest,
  submitGameModeActionForQuest,
  failQuestForPlayer,
  dismissQuestPreparationBriefing,
} from "../services/questService"

export function useQuestLogic(userId: string | undefined) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [questMessage, setQuestMessage] = useState<string | null>(null)
  const completingRef = useRef(false)

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

  const newQuest = useCallback(
    async (channel: QuestRequestChannel = "side") => {
      if (!userId) return
      setBusy(true)
      setQuestMessage(null)
      try {
        await requestNewQuest(userId, channel)
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to assign quest")
      } finally {
        setBusy(false)
      }
    },
    [userId]
  )

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

  const submitAnswer = useCallback(
    async (questId: string, answer: string) => {
      if (!userId) return null
      setBusy(true)
      setError(null)
      try {
        const result = await submitVocabularyAnswerForQuest(
          userId,
          questId,
          answer
        )
        if (result?.encounterFailed) {
          setQuestMessage("Quest failed. Penalties applied.")
        }
        return result
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to submit answer")
        return null
      } finally {
        setBusy(false)
      }
    },
    [userId]
  )

  const submitSpeech = useCallback(
    async (questId: string, transcript: string, responseTimeMs: number) => {
      if (!userId) return null
      setBusy(true)
      setError(null)
      try {
        const result = await submitSpeechForQuest(
          userId,
          questId,
          transcript,
          responseTimeMs
        )
        if (result?.encounterFailed) {
          setQuestMessage("Quest failed. Penalties applied.")
        }
        return result
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to analyze speech")
        return null
      } finally {
        setBusy(false)
      }
    },
    [userId]
  )

  const submitListening = useCallback(
    async (questId: string, answer: string) => {
      if (!userId) return null
      setBusy(true)
      setError(null)
      try {
        const result = await submitListeningAnswerForQuest(
          userId,
          questId,
          answer
        )
        if (result?.encounterFailed) {
          setQuestMessage("Quest failed. Penalties applied.")
        }
        return result
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to submit decode")
        return null
      } finally {
        setBusy(false)
      }
    },
    [userId]
  )

  const sendMessage = useCallback(
    async (questId: string, message: string) => {
      if (!userId) return null
      setBusy(true)
      setError(null)
      try {
        const result = await submitConversationMessageForQuest(
          userId,
          questId,
          message
        )
        if (result?.encounterFailed) {
          setQuestMessage("Quest failed. Penalties applied.")
        }
        return result
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to send message")
        return null
      } finally {
        setBusy(false)
      }
    },
    [userId]
  )

  const abandon = useCallback(
    async (questId: string) => {
      if (!userId) return
      setBusy(true)
      try {
        await failQuestForPlayer(userId, questId)
        setQuestMessage("Contract abandoned. Penalties applied.")
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to abandon quest")
      } finally {
        setBusy(false)
      }
    },
    [userId]
  )

  const dismissPreparation = useCallback(
    async (questId: string) => {
      if (!userId) return
      setBusy(true)
      try {
        await dismissQuestPreparationBriefing(userId, questId)
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "Failed to dismiss preparation"
        )
      } finally {
        setBusy(false)
      }
    },
    [userId]
  )

  const submitGameModeAction = useCallback(
    async (questId: string, action: string, payload?: string) => {
      if (!userId) return null
      setBusy(true)
      setError(null)
      try {
        const result = await submitGameModeActionForQuest(
          userId,
          questId,
          action,
          payload
        )
        if (result?.message) setQuestMessage(result.message)
        return result
      } catch (e) {
        setError(e instanceof Error ? e.message : "Mode action failed")
        return null
      } finally {
        setBusy(false)
      }
    },
    [userId]
  )

  const complete = useCallback(
    async (questId: string) => {
      if (!userId || completingRef.current) return
      completingRef.current = true
      setBusy(true)
      setQuestMessage(null)
      try {
        await finishQuest(userId, questId)
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to complete quest")
      } finally {
        completingRef.current = false
        setBusy(false)
      }
    },
    [userId]
  )

  return {
    busy,
    error,
    questMessage,
    hydrate,
    newQuest,
    progress,
    submitAnswer,
    sendMessage,
    submitSpeech,
    submitListening,
    submitGameModeAction,
    abandon,
    dismissPreparation,
    complete,
  }
}
