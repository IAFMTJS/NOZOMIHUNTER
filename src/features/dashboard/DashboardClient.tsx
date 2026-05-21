"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/hooks/useAuth"
import { usePlayerStore } from "@/stores/usePlayerStore"
import { useQuestLogic } from "@/features/quests/hooks/useQuestLogic"
import { XPBar } from "@/components/XPBar"
import { QuestCard } from "@/features/quests/components/QuestCard"
import { xpProgressInCurrentLevel } from "@/systems/progression/levelSystem"
import { registerCoreEventHandlers } from "@/systems/events/eventHandlers"

let eventsRegistered = false

export function DashboardClient() {
  const { user, signOut, loading } = useAuth()
  const player = usePlayerStore((s) => s.player)
  const activeQuests = usePlayerStore((s) => s.activeQuests)
  const levelUpNotice = usePlayerStore((s) => s.levelUpNotice)
  const clearLevelUpNotice = usePlayerStore((s) => s.clearLevelUpNotice)
  const { busy, error, hydrate, newQuest, progress, complete } = useQuestLogic(
    user?.id
  )

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

        {activeQuests.length === 0 ? (
          <p className="text-[var(--muted)]">
            No active quests. Request one to begin the loop.
          </p>
        ) : (
          <ul className="flex flex-col gap-4">
            {activeQuests.map((quest) => (
              <li key={quest.id}>
                <QuestCard
                  quest={quest}
                  disabled={busy}
                  onProgress={() => progress(quest.id)}
                  onComplete={() => complete(quest.id)}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}
