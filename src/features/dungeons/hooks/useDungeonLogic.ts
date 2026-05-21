"use client"

import { useCallback, useState } from "react"
import {
  enterDungeon,
  deployDungeonRun,
  startDungeonSector,
  submitDungeonVocabulary,
  submitDungeonListening,
  submitDungeonConversation,
  submitDungeonSpeech,
  abandonDungeon,
  extractDungeonRewards,
} from "../services/dungeonService"

export function useDungeonLogic(userId: string | undefined) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const enter = useCallback(
    async (dungeonKey: string) => {
      if (!userId) return
      setBusy(true)
      setError(null)
      setMessage(null)
      try {
        await enterDungeon(userId, dungeonKey)
        setMessage("Dungeon contract active.")
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to enter dungeon")
      } finally {
        setBusy(false)
      }
    },
    [userId]
  )

  const deploy = useCallback(async () => {
    if (!userId) return
    setBusy(true)
    try {
      await deployDungeonRun(userId)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Deploy failed")
    } finally {
      setBusy(false)
    }
  }, [userId])

  const enterSector = useCallback(async () => {
    if (!userId) return
    setBusy(true)
    try {
      await startDungeonSector(userId)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sector start failed")
    } finally {
      setBusy(false)
    }
  }, [userId])

  const extract = useCallback(async () => {
    if (!userId) return
    setBusy(true)
    setMessage(null)
    try {
      await extractDungeonRewards(userId)
      setMessage("Dungeon cleared. Rewards extracted.")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Extraction failed")
    } finally {
      setBusy(false)
    }
  }, [userId])

  const submitAnswer = useCallback(
    async (answer: string) => {
      if (!userId) return
      setBusy(true)
      try {
        const r = await submitDungeonVocabulary(userId, answer)
        if (r?.encounterFailed) setMessage("Dungeon collapse — penalties applied.")
      } catch (e) {
        setError(e instanceof Error ? e.message : "Answer failed")
      } finally {
        setBusy(false)
      }
    },
    [userId]
  )

  const submitListening = useCallback(
    async (answer: string) => {
      if (!userId) return
      setBusy(true)
      try {
        const r = await submitDungeonListening(userId, answer)
        if (r?.encounterFailed) setMessage("Dungeon collapse — penalties applied.")
      } catch (e) {
        setError(e instanceof Error ? e.message : "Listening failed")
      } finally {
        setBusy(false)
      }
    },
    [userId]
  )

  const sendMessage = useCallback(
    async (message: string) => {
      if (!userId) return
      setBusy(true)
      try {
        const r = await submitDungeonConversation(userId, message)
        if (r?.encounterFailed) setMessage("Dungeon collapse — penalties applied.")
      } catch (e) {
        setError(e instanceof Error ? e.message : "Message failed")
      } finally {
        setBusy(false)
      }
    },
    [userId]
  )

  const submitSpeech = useCallback(
    async (transcript: string, ms: number) => {
      if (!userId) return
      setBusy(true)
      try {
        const r = await submitDungeonSpeech(userId, transcript, ms)
        if (r?.encounterFailed) setMessage("Dungeon collapse — penalties applied.")
      } catch (e) {
        setError(e instanceof Error ? e.message : "Speech failed")
      } finally {
        setBusy(false)
      }
    },
    [userId]
  )

  const abandon = useCallback(async () => {
    if (!userId) return
    setBusy(true)
    try {
      await abandonDungeon(userId)
      setMessage("Dungeon aborted.")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Abort failed")
    } finally {
      setBusy(false)
    }
  }, [userId])

  return {
    busy,
    error,
    message,
    enter,
    deploy,
    enterSector,
    extract,
    submitAnswer,
    submitListening,
    sendMessage,
    submitSpeech,
    abandon,
  }
}
