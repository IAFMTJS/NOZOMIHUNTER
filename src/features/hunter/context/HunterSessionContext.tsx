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
import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"
import { usePlayerStore } from "@/stores/usePlayerStore"
import { useQuestLogic } from "@/features/quests/hooks/useQuestLogic"
import { useDungeonLogic } from "@/features/dungeons/hooks/useDungeonLogic"
import { registerCoreEventHandlers } from "@/systems/events/eventHandlers"
import { syncCorruptionAudio } from "@/systems/audio/registerAudioHandlers"
import { unlockAudio } from "@/systems/audio/audioSystem"
import { getHunterPresentation } from "@/systems/presentation/hunterPresentationSystem"
import { isTutorialComplete } from "@/systems/tutorial/tutorialSystem"
import { SupabaseSetupNotice } from "@/components/SupabaseSetupNotice"
import { HunterShellLayout } from "@/components/layout/HunterShellLayout"
import { HunterPage } from "@/components/layout/HunterPage"
import { EncounterHost } from "@/features/hunter/components/EncounterHost"
import { RewardClaimOverlay } from "@/features/rewards/components/RewardClaimOverlay"
import { LevelUpCeremony } from "@/components/ceremonies/LevelUpCeremony"
import { AchievementUnlockCeremony } from "@/components/ceremonies/AchievementUnlockCeremony"
import {
  MasteryTierUpCeremony,
  type MasteryTierUpCeremonyData,
} from "@/components/ceremonies/MasteryTierUpCeremony"
import type { CanonicalMasteryTier } from "@/systems/presentation/masteryPresentationSystem"
import { detectNewAchievements } from "@/systems/presentation/achievements/achievementUnlockPresentation"
import { achievementUnlockFingerprint } from "@/systems/presentation/achievements/achievementUnlockSnapshot"
import type { AchievementContract } from "@/systems/progression/achievementSystem"
import { RankUpNotice } from "@/components/RankUpNotice"
import { UnlockNotice } from "@/components/UnlockNotice"
import { InstallPrompt } from "@/components/InstallPrompt"
import { FirstQuestTutorial } from "@/features/quests/components/FirstQuestTutorial"
import { clearPendingRewardsGuarded } from "@/services/supabase/economyRepository"
import { clearPendingRewards } from "@/systems/rewards/rewardClaimSystem"
import { hydratePlayerFromDb } from "@/features/quests/services/questService"
import { trackMissionForUser } from "@/features/hunter/services/missionTrackingService"
import { eventBus } from "@/systems/events/eventBus"
import { GAME_EVENTS } from "@/systems/events/eventTypes"
import type { HubView } from "@/features/hub/ContractHub"
import type { PlayerContract } from "@/contracts/player-contract"
import type { QuestContract } from "@/contracts/quest-contract"
import type { ReadinessResultContract } from "@/contracts/readiness-contract"
import type { DungeonForecastContract } from "@/systems/dungeons/dungeonForecastSystem"
import { SyncDisciplineCeremony } from "@/features/rewards/components/SyncDisciplineCeremony"
import { SYNCHRONIZATION_CONFIG } from "@/config/synchronizationConfig"
import { useHunterReadiness } from "@/features/hunter/hooks/useHunterReadiness"

let eventsRegistered = false

export interface HunterSessionValue {
  user: ReturnType<typeof useAuth>["user"]
  configured: boolean
  player: PlayerContract | null
  activeQuests: QuestContract[]
  regularQuests: QuestContract[]
  activeDungeon: QuestContract | undefined
  hunterPresentation: ReturnType<typeof getHunterPresentation>
  readiness: ReadinessResultContract | null
  forecast: DungeonForecastContract | null
  quest: ReturnType<typeof useQuestLogic>
  dungeon: ReturnType<typeof useDungeonLogic>
  hubView: HubView
  setHubView: (view: HubView) => void
  trackMission: (questId: string) => Promise<void>
  claimRewards: () => Promise<void>
  signOut: () => Promise<void>
  showTutorial: boolean
  dismissTutorial: () => void
}

const HunterSessionContext = createContext<HunterSessionValue | null>(null)

export function HunterSessionProvider({ children }: { children: ReactNode }) {
  const { user, signOut, loading, configured } = useAuth()
  const player = usePlayerStore((s) => s.player)
  const activeQuests = usePlayerStore((s) => s.activeQuests)
  const levelUpCeremony = usePlayerStore((s) => s.levelUpCeremony)
  const clearLevelUpCeremony = usePlayerStore((s) => s.clearLevelUpCeremony)
  const rankUpNotice = usePlayerStore((s) => s.rankUpNotice)
  const clearRankUpNotice = usePlayerStore((s) => s.clearRankUpNotice)
  const unlockNoticeQueue = usePlayerStore((s) => s.unlockNoticeQueue)
  const dismissUnlockNotice = usePlayerStore((s) => s.dismissUnlockNotice)
  const setPlayer = usePlayerStore((s) => s.setPlayer)
  const [tutorialDismissed, setTutorialDismissed] = useState(false)
  const [hubView, setHubView] = useState<HubView>("menu")
  const [claimError, setClaimError] = useState<string | null>(null)
  const [syncCeremonyKey, setSyncCeremonyKey] = useState<string | null>(null)
  const [achievementQueue, setAchievementQueue] = useState<AchievementContract[]>([])
  const [masteryTierQueue, setMasteryTierQueue] = useState<MasteryTierUpCeremonyData[]>([])

  const quest = useQuestLogic(user?.id)
  const dungeon = useDungeonLogic(user?.id)

  const activeDungeon = activeQuests.find(
    (q) => q.type === "DUNGEON" && q.dungeonRun
  )
  const regularQuests = activeQuests.filter((q) => q.type !== "DUNGEON")

  const showTutorial =
    Boolean(player) &&
    !isTutorialComplete(player!) &&
    !tutorialDismissed &&
    activeQuests.some((q) => q.isTutorial)

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
    if (!user?.id || !player) {
      setSyncCeremonyKey(null)
      return
    }
    const storageKey = `nozomi-sync-ceremony-seen:${user.id}`
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
  }, [user?.id, player, syncTitleFingerprint])

  const dismissSyncCeremony = useCallback(() => {
    if (!user?.id || !syncCeremonyKey) return
    const storageKey = `nozomi-sync-ceremony-seen:${user.id}`
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
  }, [user?.id, syncCeremonyKey])

  useEffect(() => {
    const onMasteryTier = (payload: unknown) => {
      const p = payload as {
        wordId?: string
        tier?: CanonicalMasteryTier
        mastery?: number
      }
      const wordId = p.wordId
      const tier = p.tier
      if (!wordId || !tier) return
      setMasteryTierQueue((q) => [
        ...q,
        {
          wordId,
          tier,
          mastery: p.mastery ?? 0,
        },
      ])
    }
    eventBus.on(GAME_EVENTS.MASTERY_TIER_UP, onMasteryTier)
    return () => {
      eventBus.off(GAME_EVENTS.MASTERY_TIER_UP, onMasteryTier)
    }
  }, [])

  useEffect(() => {
    if (!eventsRegistered) {
      registerCoreEventHandlers()
      eventsRegistered = true
    }
  }, [])

  useEffect(() => {
    if (user?.id) void quest.hydrate()
    // Hydrate once per signed-in user — quest hook returns a new object each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  useEffect(() => {
    if (player) syncCorruptionAudio(player.penalties.corruption)
  }, [player])

  const { readiness, forecast } = useHunterReadiness(player, activeQuests)

  const hunterPresentation = useMemo(
    () =>
      player
        ? getHunterPresentation(player)
        : {
            shellClass: "",
            encounterClass: "",
            transitionSlow: false,
            portraitClass: "",
            identityAuraClass: "",
            shopAuraClass: "",
            readinessClass: "",
            headerClass: "",
            huntCtaClass: "",
          },
    [player]
  )

  const trackMission = useCallback(
    async (questId: string) => {
      if (!user?.id) return
      await trackMissionForUser(user.id, questId)
    },
    [user?.id]
  )

  const claimRewards = useCallback(async () => {
    if (!player) return
    setClaimError(null)
    try {
      await clearPendingRewardsGuarded()
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not sync rewards with the registry."
      setClaimError(message)
      return
    }
    setPlayer(clearPendingRewards(player))
    eventBus.emit(GAME_EVENTS.REWARDS_CLAIMED, { playerId: user?.id ?? player.id })
    if (user?.id) await hydratePlayerFromDb(user.id)
  }, [player, setPlayer, user?.id])

  const handleSignOut = useCallback(async () => {
    unlockAudio()
    await signOut()
    window.location.href = "/"
  }, [signOut])

  const value: HunterSessionValue = {
    user,
    configured,
    player,
    activeQuests,
    regularQuests,
    activeDungeon,
    hunterPresentation,
    readiness,
    forecast,
    quest,
    dungeon,
    hubView,
    setHubView,
    trackMission,
    claimRewards,
    signOut: handleSignOut,
    showTutorial,
    dismissTutorial: () => setTutorialDismissed(true),
  }

  if (loading) {
    return (
      <HunterShellLayout shellClassName={hunterPresentation.shellClass}>
        <HunterPage>
          <p className="text-[var(--muted)]">Syncing hunter registry…</p>
        </HunterPage>
      </HunterShellLayout>
    )
  }

  if (!configured) {
    return (
      <HunterShellLayout>
        <HunterPage>
          <SupabaseSetupNotice />
        </HunterPage>
      </HunterShellLayout>
    )
  }

  if (!user) {
    return (
      <HunterShellLayout>
        <HunterPage>
          <p>
            <Link href="/login" className="text-[var(--accent-bright)] hover:underline">
              Sign in
            </Link>{" "}
            to access the hunter system.
          </p>
        </HunterPage>
      </HunterShellLayout>
    )
  }

  return (
    <HunterSessionContext.Provider value={value}>
      <HunterShellLayout
        shellClassName={hunterPresentation.shellClass}
        headerClassName={hunterPresentation.headerClass}
      >
      {syncCeremonyKey && player && (
        <SyncDisciplineCeremony
          unlockKey={syncCeremonyKey}
          chainDays={player.synchronization.chainDays}
          onDismiss={dismissSyncCeremony}
        />
      )}
      {player?.pendingRewards && !player.pendingRewards.claimed && (
        <RewardClaimOverlay
          player={player}
          bundle={player.pendingRewards}
          activeQuests={activeQuests}
          claimError={claimError}
          onClaimAll={() => void claimRewards()}
        />
      )}

      {masteryTierQueue[0] != null && achievementQueue[0] == null && (
        <MasteryTierUpCeremony
          data={masteryTierQueue[0]}
          onDismiss={() => setMasteryTierQueue((q) => q.slice(1))}
        />
      )}
      {achievementQueue[0] != null && (
        <AchievementUnlockCeremony
          achievement={achievementQueue[0]}
          onDismiss={() => setAchievementQueue((q) => q.slice(1))}
        />
      )}
      {levelUpCeremony != null && (
        <LevelUpCeremony
          data={levelUpCeremony}
          onDismiss={clearLevelUpCeremony}
        />
      )}
      {rankUpNotice != null && (
        <RankUpNotice rank={rankUpNotice} onDismiss={clearRankUpNotice} />
      )}
      {unlockNoticeQueue[0] != null && (
        <UnlockNotice
          unlockKey={unlockNoticeQueue[0]}
          onDismiss={dismissUnlockNotice}
        />
      )}

      <InstallPrompt />
      {showTutorial && (
        <FirstQuestTutorial onDismiss={() => setTutorialDismissed(true)} />
      )}

      <EncounterHost />

      {children}
      </HunterShellLayout>
    </HunterSessionContext.Provider>
  )
}

export function useHunterSession(): HunterSessionValue {
  const ctx = useContext(HunterSessionContext)
  if (!ctx) {
    throw new Error("useHunterSession must be used within HunterSessionProvider")
  }
  return ctx
}
