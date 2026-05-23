"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
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
import { LevelUpNotice } from "@/components/LevelUpNotice"
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
  const levelUpNotice = usePlayerStore((s) => s.levelUpNotice)
  const clearLevelUpNotice = usePlayerStore((s) => s.clearLevelUpNotice)
  const rankUpNotice = usePlayerStore((s) => s.rankUpNotice)
  const clearRankUpNotice = usePlayerStore((s) => s.clearRankUpNotice)
  const unlockNoticeQueue = usePlayerStore((s) => s.unlockNoticeQueue)
  const dismissUnlockNotice = usePlayerStore((s) => s.dismissUnlockNotice)
  const setPlayer = usePlayerStore((s) => s.setPlayer)
  const [tutorialDismissed, setTutorialDismissed] = useState(false)
  const [hubView, setHubView] = useState<HubView>("menu")
  const [claimError, setClaimError] = useState<string | null>(null)

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
            readinessClass: "",
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
      <HunterShellLayout shellClassName={hunterPresentation.shellClass}>
      {player?.pendingRewards && !player.pendingRewards.claimed && (
        <RewardClaimOverlay
          player={player}
          bundle={player.pendingRewards}
          claimError={claimError}
          onClaimAll={() => void claimRewards()}
        />
      )}

      {levelUpNotice != null && (
        <LevelUpNotice level={levelUpNotice} onDismiss={clearLevelUpNotice} />
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
