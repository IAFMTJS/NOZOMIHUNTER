"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { PlayerContract } from "@/contracts/player-contract"
import type { AchievementContract } from "@/systems/progression/achievementSystem"
import type { CanonicalMasteryTier } from "@/systems/presentation/masteryPresentationSystem"
import type { MasteryTierUpCeremonyData } from "@/components/ceremonies/MasteryTierUpCeremony"
import type { ArchiveUnlockCeremonyData } from "@/components/ceremonies/ArchiveUnlockCeremony"
import type { WordBindCeremonyData } from "@/components/ceremonies/WordBindCeremony"
import { detectNewAchievements } from "@/systems/presentation/achievements/achievementUnlockPresentation"
import { achievementUnlockFingerprint } from "@/systems/presentation/achievements/achievementUnlockSnapshot"
import { eventBus } from "@/systems/events/eventBus"
import { GAME_EVENTS } from "@/systems/events/eventTypes"
import { SYNCHRONIZATION_CONFIG } from "@/config/synchronizationConfig"

export function useHunterCeremonies(
  player: PlayerContract | null,
  userId: string | undefined
) {
  const [achievementQueue, setAchievementQueue] = useState<AchievementContract[]>([])
  const [masteryTierQueue, setMasteryTierQueue] = useState<MasteryTierUpCeremonyData[]>([])
  const [archiveUnlockQueue, setArchiveUnlockQueue] = useState<ArchiveUnlockCeremonyData[]>([])
  const [wordBindQueue, setWordBindQueue] = useState<WordBindCeremonyData[]>([])
  const [syncCeremonyKey, setSyncCeremonyKey] = useState<string | null>(null)
  const prevPlayerRef = useRef<PlayerContract | null>(null)

  const achievementFingerprint = useMemo(
    () => (player ? achievementUnlockFingerprint(player) : null),
    [player]
  )

  useEffect(() => {
    if (!player) {
      prevPlayerRef.current = null
      return
    }
    const prev = prevPlayerRef.current
    if (prev && prev.id === player.id) {
      const newly = detectNewAchievements(prev, player)
      if (newly.length > 0) {
        setAchievementQueue((q) => [...q, ...newly])
        for (const a of newly) {
          eventBus.emit(GAME_EVENTS.ACHIEVEMENT_UNLOCKED, {
            playerId: player.id,
            achievementId: a.id,
            title: a.title,
            description: a.description,
          })
        }
      }
    }
    prevPlayerRef.current = player
  }, [player, achievementFingerprint])

  const syncTitleFingerprint = useMemo(
    () => player?.progression.titles.slice().sort().join("|") ?? "",
    [player?.progression.titles]
  )

  useEffect(() => {
    if (!userId || !player) {
      setSyncCeremonyKey(null)
      return
    }
    const storageKey = `nozomi-sync-ceremony-seen:${userId}`
    let seen: string[] = []
    try {
      seen = JSON.parse(localStorage.getItem(storageKey) ?? "[]") as string[]
    } catch {
      seen = []
    }
    const disciplineKeys = SYNCHRONIZATION_CONFIG.MILESTONES.map((m) => m.unlock)
    const earned = player.progression.titles.filter((t) =>
      (disciplineKeys as string[]).includes(t)
    )
    const pending = earned.find((k) => !seen.includes(k))
    setSyncCeremonyKey(pending ?? null)
  }, [userId, player, syncTitleFingerprint])

  const dismissSyncCeremony = useCallback(() => {
    if (!userId || !syncCeremonyKey) return
    const storageKey = `nozomi-sync-ceremony-seen:${userId}`
    let seen: string[] = []
    try {
      seen = JSON.parse(localStorage.getItem(storageKey) ?? "[]") as string[]
    } catch {
      seen = []
    }
    if (!seen.includes(syncCeremonyKey)) {
      seen.push(syncCeremonyKey)
      localStorage.setItem(storageKey, JSON.stringify(seen))
    }
    setSyncCeremonyKey(null)
  }, [userId, syncCeremonyKey])

  useEffect(() => {
    const onMasteryTier = (payload: unknown) => {
      const p = payload as {
        wordId?: string
        tier?: CanonicalMasteryTier
        mastery?: number
      }
      if (!p.wordId || !p.tier) return
      setMasteryTierQueue((q) => [
        ...q,
        {
          wordId: p.wordId,
          tier: p.tier,
          mastery: p.mastery ?? 0,
        } as MasteryTierUpCeremonyData,
      ])
    }
    const onArchiveUnlock = (payload: unknown) => {
      const p = payload as {
        archiveUnlockId?: string
        title?: string
        excerpt?: string
      }
      if (!p.archiveUnlockId) return
      const archiveUnlockId = p.archiveUnlockId
      setArchiveUnlockQueue((q) => [
        ...q,
        {
          archiveUnlockId,
          title: p.title ?? archiveUnlockId.replace(/-/g, " "),
          excerpt: p.excerpt,
        },
      ])
    }
    const onWordBound = (payload: unknown) => {
      const p = payload as { wordId?: string; mastery?: number }
      if (!p.wordId) return
      const wordId = p.wordId
      setWordBindQueue((q) => [
        ...q,
        { wordId, mastery: p.mastery ?? 80 },
      ])
    }
    eventBus.on(GAME_EVENTS.MASTERY_TIER_UP, onMasteryTier)
    eventBus.on(GAME_EVENTS.ARCHIVE_UNLOCKED, onArchiveUnlock)
    eventBus.on(GAME_EVENTS.WORD_BOUND, onWordBound)
    return () => {
      eventBus.off(GAME_EVENTS.MASTERY_TIER_UP, onMasteryTier)
      eventBus.off(GAME_EVENTS.ARCHIVE_UNLOCKED, onArchiveUnlock)
      eventBus.off(GAME_EVENTS.WORD_BOUND, onWordBound)
    }
  }, [])

  const popAchievement = useCallback(() => {
    setAchievementQueue((q) => q.slice(1))
  }, [])

  const popMasteryTier = useCallback(() => {
    setMasteryTierQueue((q) => q.slice(1))
  }, [])

  const popArchiveUnlock = useCallback(() => {
    setArchiveUnlockQueue((q) => q.slice(1))
  }, [])

  const popWordBind = useCallback(() => {
    setWordBindQueue((q) => q.slice(1))
  }, [])

  return {
    achievementQueue,
    masteryTierQueue,
    archiveUnlockQueue,
    wordBindQueue,
    syncCeremonyKey,
    dismissSyncCeremony,
    popAchievement,
    popMasteryTier,
    popArchiveUnlock,
    popWordBind,
  }
}
