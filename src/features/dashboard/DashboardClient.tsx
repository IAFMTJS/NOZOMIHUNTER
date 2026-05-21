"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"
import { usePlayerStore } from "@/stores/usePlayerStore"
import { useQuestLogic } from "@/features/quests/hooks/useQuestLogic"
import { useDungeonLogic } from "@/features/dungeons/hooks/useDungeonLogic"
import { DungeonRunner } from "@/features/dungeons/components/DungeonRunner"
import { listAvailableDungeons } from "@/config/dungeonConfig"
import { hasActiveDungeon } from "@/systems/dungeons/dungeonAccess"
import { XPBar } from "@/components/XPBar"
import { PenaltyStatus } from "@/components/PenaltyStatus"
import { QuestCard } from "@/features/quests/components/QuestCard"
import { FirstQuestTutorial } from "@/features/quests/components/FirstQuestTutorial"
import { xpProgressInCurrentLevel } from "@/systems/progression/levelSystem"
import { registerCoreEventHandlers } from "@/systems/events/eventHandlers"
import { SupabaseSetupNotice } from "@/components/SupabaseSetupNotice"
import { isTutorialComplete } from "@/systems/tutorial/tutorialSystem"

let eventsRegistered = false

export function DashboardClient() {
  const { user, signOut, loading, configured } = useAuth()
  const player = usePlayerStore((s) => s.player)
  const activeQuests = usePlayerStore((s) => s.activeQuests)
  const levelUpNotice = usePlayerStore((s) => s.levelUpNotice)
  const clearLevelUpNotice = usePlayerStore((s) => s.clearLevelUpNotice)
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
    abandon,
    complete,
  } = useQuestLogic(user?.id)

  const dungeon = useDungeonLogic(user?.id)
  const activeDungeon = activeQuests.find(
    (q) => q.type === "DUNGEON" && q.dungeonRun
  )
  const regularQuests = activeQuests.filter((q) => q.type !== "DUNGEON")
  const availableDungeons = player
    ? listAvailableDungeons(player.level, player.progression.unlockedDungeons)
    : []

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

  if (loading) {
    return <p className="p-8 text-[var(--muted)]">Loading session...</p>
  }

  if (!configured) {
    return (
      <main className="mx-auto max-w-2xl p-8">
        <SupabaseSetupNotice />
      </main>
    )
  }

  if (!user) {
    return (
      <p className="p-8">
        <Link href="/login" className="text-[var(--accent)]">
          Sign in
        </Link>
      </p>
    )
  }

  const progressBar = player
    ? xpProgressInCurrentLevel(player.xp, player.level)
    : { current: 0, required: 100 }

  return (
    <main className="mx-auto max-w-2xl p-8">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--accent)]">Dashboard</h1>
          <p className="text-[var(--muted)]">
            {player?.username ?? "Hunter"} · Rank {player?.rank ?? "E"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => signOut().then(() => (window.location.href = "/"))}
          className="text-sm text-[var(--muted)] hover:underline"
        >
          Sign out
        </button>
      </header>

      {levelUpNotice && (
        <div
          className="mb-6 rounded border border-[var(--accent)] bg-[var(--accent)]/10 p-4"
          role="status"
        >
          <p className="font-semibold text-[var(--accent)]">
            Level Up — Level {levelUpNotice}
          </p>
          <button
            type="button"
            className="mt-2 text-sm underline"
            onClick={clearLevelUpNotice}
          >
            Dismiss
          </button>
        </div>
      )}

      {player && (
        <section className="mb-8">
          <XPBar
            currentXP={progressBar.current}
            requiredXP={progressBar.required}
            level={player.level}
          />
        </section>
      )}

      {player && <PenaltyStatus penalties={player.penalties} />}

      {showTutorial && (
        <FirstQuestTutorial onDismiss={() => setTutorialDismissed(true)} />
      )}

      {(availableDungeons.length > 0 || activeDungeon) && (
        <section className="mb-8">
          <h2 className="mb-4 text-lg font-semibold">Dungeons</h2>
          {!activeDungeon && (
            <div className="mb-4 flex flex-wrap gap-2">
              {availableDungeons.map((def) => (
                <button
                  key={def.key}
                  type="button"
                  disabled={dungeon.busy || hasActiveDungeon(activeQuests)}
                  onClick={() => dungeon.enter(def.key)}
                  className="rounded border border-[var(--accent)] px-3 py-1 text-sm text-[var(--accent)] hover:bg-[var(--accent)] hover:text-black disabled:opacity-50"
                >
                  Enter {def.name}
                </button>
              ))}
            </div>
          )}
          {dungeon.error && (
            <p className="mb-4 text-sm text-[var(--danger)]">{dungeon.error}</p>
          )}
          {dungeon.message && (
            <p className="mb-4 text-sm text-[var(--muted)]">{dungeon.message}</p>
          )}
          {activeDungeon && (
            <DungeonRunner
              quest={activeDungeon}
              disabled={dungeon.busy}
              onDeploy={dungeon.deploy}
              onEnterSector={dungeon.enterSector}
              onExtract={dungeon.extract}
              onSubmitAnswer={dungeon.submitAnswer}
              onSubmitListening={dungeon.submitListening}
              onSendMessage={dungeon.sendMessage}
              onSubmitSpeech={dungeon.submitSpeech}
              onAbandon={dungeon.abandon}
            />
          )}
        </section>
      )}

      <section className="mb-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Active Quests</h2>
          <button
            type="button"
            disabled={busy}
            onClick={newQuest}
            className="rounded border border-[var(--accent)] px-3 py-1 text-sm text-[var(--accent)] hover:bg-[var(--accent)] hover:text-black disabled:opacity-50"
          >
            New Quest
          </button>
        </div>

        {error && <p className="mb-4 text-sm text-[var(--danger)]">{error}</p>}
        {questMessage && (
          <p className="mb-4 text-sm text-[var(--muted)]">{questMessage}</p>
        )}

        {regularQuests.length === 0 ? (
          <p className="text-[var(--muted)]">
            No active quests. Request one to begin the loop.
          </p>
        ) : (
          <ul className="flex flex-col gap-4">
            {regularQuests.map((quest) => (
              <li key={quest.id}>
                <QuestCard
                  quest={quest}
                  disabled={busy}
                  onProgress={() => progress(quest.id)}
                  onComplete={() => complete(quest.id)}
                  onSubmitAnswer={(answer) => submitAnswer(quest.id, answer)}
                  onSendMessage={(message) => sendMessage(quest.id, message)}
                  onSubmitSpeech={(transcript, ms) =>
                    submitSpeech(quest.id, transcript, ms)
                  }
                  onAbandon={() => abandon(quest.id)}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
