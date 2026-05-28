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
import { useAuth } from "@/hooks/useAuth"
import { usePlayerStore } from "@/stores/usePlayerStore"
import { useQuestLogic } from "@/features/quests/hooks/useQuestLogic"
import { useDungeonLogic } from "@/features/dungeons/hooks/useDungeonLogic"
import { unlockAudio } from "@/systems/audio/audioSystem"
import { getHunterPresentation } from "@/systems/presentation/hunterPresentationSystem"
import { isTutorialComplete } from "@/systems/tutorial/tutorialSystem"
import { HunterShellLayout } from "@/components/layout/HunterShellLayout"
import { EncounterHost } from "@/features/hunter/components/EncounterHost"
import { HunterSessionGate } from "@/features/hunter/components/HunterSessionGate"
import { useHunterHydration } from "@/features/hunter/hooks/useHunterHydration"
import { RewardClaimOverlay } from "@/features/rewards/components/RewardClaimOverlay"
import { LevelUpCeremony } from "@/components/ceremonies/LevelUpCeremony"
import { AchievementUnlockCeremony } from "@/components/ceremonies/AchievementUnlockCeremony"
import { MasteryTierUpCeremony } from "@/components/ceremonies/MasteryTierUpCeremony"
import { RankUpNotice } from "@/components/RankUpNotice"
import { UnlockNotice } from "@/components/UnlockNotice"
import { InstallPrompt } from "@/components/InstallPrompt"
import { FirstQuestTutorial } from "@/features/quests/components/FirstQuestTutorial"
import { hydratePlayerFromDb } from "@/features/quests/services/questService"
import { trackMissionForUser } from "@/features/hunter/services/missionTrackingService"
import type { HubView } from "@/features/hub/ContractHub"
import { useHunterHubState } from "@/features/hunter/hooks/useHunterHubState"
import { useHunterCeremonies } from "@/features/hunter/hooks/useHunterCeremonies"
import { useHunterRewardClaim } from "@/features/hunter/hooks/useHunterRewardClaim"
import type { PlayerContract } from "@/contracts/player-contract"
import type { QuestContract } from "@/contracts/quest-contract"
import type { ReadinessResultContract } from "@/contracts/readiness-contract"
import type { DungeonForecastContract } from "@/systems/dungeons/dungeonForecastSystem"
import { SyncDisciplineCeremony } from "@/features/rewards/components/SyncDisciplineCeremony"
import { useHunterReadiness } from "@/features/hunter/hooks/useHunterReadiness"

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
  hubFocusQuestId: string | null
  setHubFocusQuestId: (questId: string | null) => void
  trackMission: (questId: string) => Promise<void>
  claimRewards: () => Promise<void>
  signOut: () => Promise<void>
  showTutorial: boolean
  dismissTutorial: () => void
}

const HunterSessionContext = createContext<HunterSessionValue | null>(null)

export function HunterSessionProvider({ children }: { children: ReactNode }) {
  const hydration = useHunterHydration()
  const { user, signOut, configured, player, phase, quest } = hydration
  const activeQuests = usePlayerStore((s) => s.activeQuests)
  const levelUpCeremony = usePlayerStore((s) => s.levelUpCeremony)
  const clearLevelUpCeremony = usePlayerStore((s) => s.clearLevelUpCeremony)
  const rankUpNotice = usePlayerStore((s) => s.rankUpNotice)
  const clearRankUpNotice = usePlayerStore((s) => s.clearRankUpNotice)
  const unlockNoticeQueue = usePlayerStore((s) => s.unlockNoticeQueue)
  const dismissUnlockNotice = usePlayerStore((s) => s.dismissUnlockNotice)
  const setPlayer = usePlayerStore((s) => s.setPlayer)
  const [tutorialDismissed, setTutorialDismissed] = useState(false)
  const { hubView, setHubView, hubFocusQuestId, setHubFocusQuestId } =
    useHunterHubState()
  const {
    achievementQueue,
    masteryTierQueue,
    syncCeremonyKey,
    dismissSyncCeremony,
    popAchievement,
    popMasteryTier,
  } = useHunterCeremonies(player, user?.id)
  const { claimRewards, claimError } = useHunterRewardClaim(
    player,
    user?.id,
    setPlayer
  )

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
    hubFocusQuestId,
    setHubFocusQuestId,
    trackMission,
    claimRewards,
    signOut: handleSignOut,
    showTutorial,
    dismissTutorial: () => setTutorialDismissed(true),
  }

  return (
    <HunterSessionGate phase={phase} shellClassName={hunterPresentation.shellClass}>
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
          onDismiss={popMasteryTier}
        />
      )}
      {achievementQueue[0] != null && (
        <AchievementUnlockCeremony
          achievement={achievementQueue[0]}
          onDismiss={popAchievement}
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
    </HunterSessionGate>
  )
}

export function useHunterSession(): HunterSessionValue {
  const ctx = useContext(HunterSessionContext)
  if (!ctx) {
    throw new Error("useHunterSession must be used within HunterSessionProvider")
  }
  return ctx
}
