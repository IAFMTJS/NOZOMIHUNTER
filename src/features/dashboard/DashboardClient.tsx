"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"
import { usePlayerStore } from "@/stores/usePlayerStore"
import { useQuestLogic } from "@/features/quests/hooks/useQuestLogic"
import { useDungeonLogic } from "@/features/dungeons/hooks/useDungeonLogic"
import { ContractHub } from "@/features/dashboard/ContractHub"
import { XPBar } from "@/components/XPBar"
import { UnlockNotice } from "@/components/UnlockNotice"
import { RankUpNotice } from "@/components/RankUpNotice"
import { InstallPrompt } from "@/components/InstallPrompt"
import { PenaltyStatus } from "@/components/PenaltyStatus"
import { FirstQuestTutorial } from "@/features/quests/components/FirstQuestTutorial"
import { xpProgressInCurrentLevel } from "@/systems/progression/levelSystem"
import { registerCoreEventHandlers } from "@/systems/events/eventHandlers"
import { SupabaseSetupNotice } from "@/components/SupabaseSetupNotice"
import { isTutorialComplete } from "@/systems/tutorial/tutorialSystem"
import { HunterShell } from "@/components/layout/HunterShell"
import { getPenaltyPresentation } from "@/systems/presentation/penaltyPresentationSystem"
import { syncCorruptionAudio } from "@/systems/audio/registerAudioHandlers"
import { unlockAudio } from "@/systems/audio/audioSystem"
import { LevelUpNotice } from "@/components/LevelUpNotice"

let eventsRegistered = false

export function DashboardClient() {
  const { user, signOut, loading, configured } = useAuth()
  const player = usePlayerStore((s) => s.player)
  const activeQuests = usePlayerStore((s) => s.activeQuests)
  const levelUpNotice = usePlayerStore((s) => s.levelUpNotice)
  const clearLevelUpNotice = usePlayerStore((s) => s.clearLevelUpNotice)
  const rankUpNotice = usePlayerStore((s) => s.rankUpNotice)
  const clearRankUpNotice = usePlayerStore((s) => s.clearRankUpNotice)
  const unlockNoticeQueue = usePlayerStore((s) => s.unlockNoticeQueue)
  const dismissUnlockNotice = usePlayerStore((s) => s.dismissUnlockNotice)
  const [tutorialDismissed, setTutorialDismissed] = useState(false)

  const {
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
    abandon,
    dismissPreparation,
    complete,
  } = useQuestLogic(user?.id)

  const dungeon = useDungeonLogic(user?.id)
  const activeDungeon = activeQuests.find(
    (q) => q.type === "DUNGEON" && q.dungeonRun
  )
  const regularQuests = activeQuests.filter((q) => q.type !== "DUNGEON")
  const showTutorial =
    player &&
    !isTutorialComplete(player) &&
    !tutorialDismissed &&
    activeQuests.some((q) => q.isTutorial)

  useEffect(() => {
    if (!eventsRegistered) {
      registerCoreEventHandlers()
      eventsRegistered = true
    }
  }, [])

  useEffect(() => {
    if (user?.id) hydrate()
  }, [user?.id, hydrate])

  useEffect(() => {
    if (player) syncCorruptionAudio(player.penalties.corruption)
  }, [player?.penalties.corruption])

  if (loading) {
    return (
      <HunterShell pageTitle="Command node">
        <p className="text-[var(--muted)]">Syncing hunter registry…</p>
      </HunterShell>
    )
  }

  if (!configured) {
    return (
      <HunterShell pageTitle="Command node" maxWidth="md">
        <SupabaseSetupNotice />
      </HunterShell>
    )
  }

  if (!user) {
    return (
      <HunterShell pageTitle="Command node" maxWidth="md">
        <p>
          <Link href="/login" className="text-[var(--accent-bright)] hover:underline">
            Sign in
          </Link>{" "}
          to access the command node.
        </p>
      </HunterShell>
    )
  }

  const progressBar = player
    ? xpProgressInCurrentLevel(player.xp, player.level)
    : { current: 0, required: 100 }

  const penaltyPresentation = player
    ? getPenaltyPresentation(player.penalties)
    : { shellClass: "", encounterClass: "", transitionSlow: false }

  const hud = player ? (
    <div className="space-y-3">
      <XPBar
        currentXP={progressBar.current}
        requiredXP={progressBar.required}
        level={player.level}
        xpDebt={player.penalties.xpDebt}
      />
      <PenaltyStatus penalties={player.penalties} className="!p-3" />
    </div>
  ) : null

  return (
    <HunterShell
      pageTitle="Command node"
      username={player?.username ?? "Hunter"}
      rank={player?.rank}
      level={player?.level}
      hud={hud}
      shellClassName={penaltyPresentation.shellClass}
      onSignOut={() => {
        unlockAudio()
        void signOut().then(() => (window.location.href = "/"))
      }}
    >
      {levelUpNotice != null && (
        <LevelUpNotice
          level={levelUpNotice}
          onDismiss={clearLevelUpNotice}
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

      {player && (
        <ContractHub
          player={player}
          regularQuests={regularQuests}
          activeQuests={activeQuests}
          activeDungeon={activeDungeon}
          busy={busy}
          error={error}
          questMessage={questMessage}
          encounterClassName={penaltyPresentation.encounterClass}
          dungeonBusy={dungeon.busy}
          dungeonError={dungeon.error}
          dungeonMessage={dungeon.message}
          onNewQuest={newQuest}
          onEnterDungeon={dungeon.enter}
          onDungeonDeploy={dungeon.deploy}
          onDungeonEnterSector={dungeon.enterSector}
          onDungeonExtract={dungeon.extract}
          onDungeonSubmitAnswer={dungeon.submitAnswer}
          onDungeonSubmitListening={dungeon.submitListening}
          onDungeonSendMessage={dungeon.sendMessage}
          onDungeonSubmitSpeech={dungeon.submitSpeech}
          onDungeonAbandon={dungeon.abandon}
          onProgress={progress}
          onComplete={complete}
          onSubmitAnswer={(questId, answer) => submitAnswer(questId, answer)}
          onSendMessage={(questId, message) => sendMessage(questId, message)}
          onSubmitSpeech={(questId, transcript, ms) =>
            submitSpeech(questId, transcript, ms)
          }
          onSubmitListening={(questId, answer) =>
            submitListening(questId, answer)
          }
          onAbandon={abandon}
          onDismissPreparation={dismissPreparation}
        />
      )}
    </HunterShell>
  )
}
