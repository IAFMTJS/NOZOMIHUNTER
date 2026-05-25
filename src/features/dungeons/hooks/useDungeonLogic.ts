"use client"

import { useCallback, useState } from "react"
import type {
  DungeonAction,
  DungeonExtractionChoice,
  ExplorationAction,
} from "@/contracts/dungeon-contract"
import {
  enterDungeon,
  deployDungeonRun,
  advanceDungeonExploration,
  engageDungeonSector,
  continueDungeonAfterReward,
  chooseDungeonRouteExit,
  selectDungeonCombatAction,
  submitDungeonExtractionChoice,
  submitDungeonVocabulary,
  submitDungeonListening,
  submitDungeonConversation,
  submitDungeonSpeech,
  abandonDungeon,
  extractDungeonRewards,
  applyDungeonListeningReplayPenalty,
} from "../services/dungeonService"

export function useDungeonLogic(userId: string | undefined) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [explorationLine, setExplorationLine] = useState<string | null>(null)

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
      setExplorationLine("Corridor synchronized. Begin transit.")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Deploy failed")
    } finally {
      setBusy(false)
    }
  }, [userId])

  const advanceExploration = useCallback(
    async (action: ExplorationAction) => {
      if (!userId) return
      setBusy(true)
      try {
        const updated = await advanceDungeonExploration(userId, action)
        if (!updated) {
          setError("Corridor action failed — no active dungeon run.")
          return
        }
        const line = updated.dungeonRun?.explorationSystemLine
        if (line) setExplorationLine(line)
      } catch (e) {
        setError(e instanceof Error ? e.message : "Exploration advance failed")
      } finally {
        setBusy(false)
      }
    },
    [userId]
  )

  const engageSector = useCallback(async () => {
    if (!userId) return
    setBusy(true)
    try {
      await engageDungeonSector(userId)
      setExplorationLine(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sector engagement failed")
    } finally {
      setBusy(false)
    }
  }, [userId])

  const continueAfterReward = useCallback(async () => {
    if (!userId) return
    setBusy(true)
    try {
      await continueDungeonAfterReward(userId)
      setExplorationLine("Next breach point active. Transit corridor.")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Continue failed")
    } finally {
      setBusy(false)
    }
  }, [userId])

  const chooseRoute = useCallback(
    async (exitId: string) => {
      if (!userId) return
      setBusy(true)
      try {
        await chooseDungeonRouteExit(userId, exitId)
        setExplorationLine(null)
      } catch (e) {
        setError(e instanceof Error ? e.message : "Route choice failed")
      } finally {
        setBusy(false)
      }
    },
    [userId]
  )

  const selectCombatAction = useCallback(
    async (action: DungeonAction) => {
      if (!userId) return
      setBusy(true)
      try {
        await selectDungeonCombatAction(userId, action)
      } catch (e) {
        setError(e instanceof Error ? e.message : "Action select failed")
      } finally {
        setBusy(false)
      }
    },
    [userId]
  )

  const submitExtractionChoice = useCallback(
    async (choice: DungeonExtractionChoice) => {
      if (!userId) return
      setBusy(true)
      try {
        await submitDungeonExtractionChoice(userId, choice)
      } catch (e) {
        setError(e instanceof Error ? e.message : "Extraction choice failed")
      } finally {
        setBusy(false)
      }
    },
    [userId]
  )

  /** @deprecated Use advanceExploration + engageSector */
  const enterSector = engageSector

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

  const listeningReplay = useCallback(async () => {
    if (!userId) return
    try {
      await applyDungeonListeningReplayPenalty(userId)
    } catch {
      /* replay penalty best-effort */
    }
  }, [userId])

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
      setExplorationLine(null)
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
    explorationLine,
    enter,
    deploy,
    advanceExploration,
    engageSector,
    continueAfterReward,
    chooseRoute,
    selectCombatAction,
    submitExtractionChoice,
    enterSector,
    extract,
    submitAnswer,
    submitListening,
    listeningReplay,
    sendMessage,
    submitSpeech,
    abandon,
  }
}
